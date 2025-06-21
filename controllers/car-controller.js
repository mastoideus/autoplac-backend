import Car from "../models/Car.js";
import CarModel from "../models/CarModel.js";
import CarBrand from "../models/CarBrand.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import HttpError from "../utils/HttpError.js";
import { uploadImages } from "../supabase/uploadImages.js";
import { deleteImages } from "../supabase/deleteImages.js";

/*const getAllCars = async (req, res) => {
  try {
    const {
      brand,
      model,
      city,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      mileage,
      minYear,
      maxYear,
      sortBy,
      sortOrder,
      limit = 12,
      page = 1,
      searchTerm,
      carType,
    } = req.query;

    const queryObj = {};

    // Use search term if present and brand/model are not selected
    if (searchTerm && !(brand || model)) {
      queryObj.$text = { $search: searchTerm };
    }

    // Handle multi-value filters
    if (brand) {
      const brands = brand.split(",");
      queryObj["basicInfo.brand"] = { $in: brands };
    }

    if (model) {
      const models = model.split(",");
      queryObj["basicInfo.model"] = { $in: models };
    }

    if (city) {
      const cities = city.split(",");
      queryObj["basicInfo.city"] = { $in: cities };
    }

    if (fuelType) {
      const fuelTypes = fuelType.split(",");
      queryObj["mechanics.fuelType"] = { $in: fuelTypes };
    }

    if (transmission) {
      const transmissions = transmission.split(",");
      queryObj["mechanics.transmission"] = { $in: transmissions };
    }

    if (carType) {
      const types = carType.split(",");
      queryObj["basicInfo.type"] = { $in: types };
    }

    if (mileage) {
      queryObj["basicInfo.mileage"] = mileage;
    }

    if (minPrice || maxPrice) {
      queryObj["basicInfo.price"] = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }

    if (minYear || maxYear) {
      queryObj["basicInfo.year"] = {
        ...(minYear && { $gte: Number(minYear) }),
        ...(maxYear && { $lte: Number(maxYear) }),
      };
    }

    const skip = (page - 1) * limit;

    const sortOptions = sortBy
      ? { [sortBy]: sortOrder === "desc" ? -1 : 1 }
      : { createdAt: -1 };

    const [cars, totalCount] = await Promise.all([
      Car.find(queryObj)
        .populate("basicInfo.brand", "name")
        .populate("basicInfo.model", "name")
        .sort(sortOptions)
        .skip(Number(skip))
        .limit(Number(limit)),
      Car.countDocuments(queryObj),
    ]);

    const hasMore = page * limit < totalCount;
    const pages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: cars,
      totalCount,
      currentPage: Number(page),
      hasMore,
      pages,
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  }
};*/

const getAllCars = async (req, res) => {
  try {
    const {
      brand,
      model,
      city,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      minMileage,
      maxMileage,
      minYear,
      maxYear,
      sortBy,
      sortOrder = "desc",
      limit = 12,
      page = 1,
      searchTerm,
      carType,
      status,
      minKW,
      maxKW,
      minHS,
      maxHS,
      color,
      doors,
      seats,
      airConditioning,
      navigationSystem,
      heatedSeats,
      parkingSensors,
      abs,
      airbags,
    } = req.query;

    const queryObj = {};

    // Full-text search
    if (searchTerm && !(brand || model)) {
      queryObj.$text = { $search: searchTerm };
    }

    // Multi-value filters
    if (brand) {
      const brands = brand.split(",");
      queryObj["basicInfo.brand"] = { $in: brands };
    }

    if (model) {
      const models = model.split(",");
      queryObj["basicInfo.model"] = { $in: models };
    }

    if (city) {
      const cities = city.split(",");
      queryObj["location.city"] = { $in: cities };
    }

    if (fuelType) {
      const fuelTypes = fuelType.split(",");
      queryObj["mechanics.fuelType"] = { $in: fuelTypes };
    }

    if (transmission) {
      const transmissions = transmission.split(",");
      queryObj["mechanics.transmission"] = { $in: transmissions };
    }

    if (carType) {
      const types = carType.split(",");
      queryObj["basicInfo.type"] = { $in: types };
    }

    if (status) {
      const statusArr = status.split(",");
      queryObj["status"] = { $in: statusArr };
    }

    if (minMileage || maxMileage) {
      queryObj["basicInfo.mileage"] = {
        ...(minMileage && { $gte: Number(minMileage) }),
        ...(maxMileage && { $lte: Number(maxMileage) }),
      };
    }

    if (minPrice || maxPrice) {
      queryObj["basicInfo.price"] = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }

    if (minYear || maxYear) {
      queryObj["basicInfo.year"] = {
        ...(minYear && { $gte: Number(minYear) }),
        ...(maxYear && { $lte: Number(maxYear) }),
      };
    }

    // Power (KW / KS)
    if (minKW || maxKW) {
      queryObj["mechanics.engine.power.kw"] = {
        ...(minKW && { $gte: Number(minKW) }),
        ...(maxKW && { $lte: Number(maxKW) }),
      };
    }

    if (minHS || maxHS) {
      queryObj["mechanics.engine.power.hp"] = {
        ...(minHS && { $gte: Number(minHS) }),
        ...(maxHS && { $lte: Number(maxHS) }),
      };
    }

    // Appearance filters
    if (color) {
      const colors = color.split(",");
      queryObj["appearance.color"] = { $in: colors };
    }

    if (doors) {
      const doorNums = doors.split(",").map(Number);
      queryObj["appearance.doors"] = { $in: doorNums };
    }

    if (seats) {
      const seatNums = seats.split(",").map(Number);
      queryObj["appearance.seats"] = { $in: seatNums };
    }

    // Features (boolean flags)
    const featureFilters = {
      airConditioning,
      navigationSystem,
      heatedSeats,
      parkingSensors,
      abs,
      airbags,
    };

    for (const [key, val] of Object.entries(featureFilters)) {
      if (val === "on") {
        queryObj[`features.${key}`] = true;
      }
    }

    // Pagination and sorting
    const skip = (page - 1) * limit;

    const sortFields = {
      price: "basicInfo.price",
      year: "basicInfo.year",
      createdAt: "createdAt",
    };

    const sortKey = sortFields[sortBy] || "createdAt";

    const sortOptions = { [sortKey]: sortOrder === "desc" ? -1 : 1 };

    /*const sortOptions = sortBy
      ? { [sortBy]: sortOrder === "desc" ? -1 : 1 }
      : { createdAt: -1 };*/

    const [cars, totalCount] = await Promise.all([
      Car.find(queryObj)
        .populate("basicInfo.brand", "name")
        .populate("basicInfo.model", "name")
        .sort(sortOptions)
        .skip(Number(skip))
        .limit(Number(limit)),
      Car.countDocuments(queryObj),
    ]);

    const hasMore = page * limit < totalCount;
    const pages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: cars,
      totalCount,
      currentPage: Number(page),
      hasMore,
      pages,
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  }
};

const getCarById = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const car = await Car.findById(carId)
      .populate("basicInfo.brand", "name logo")
      .populate("basicInfo.model", "name");

    if (!car) {
      return next(new HttpError("Found no car with the given id", 404));
    }
    res.status(200).json({ data: car });
  } catch (error) {
    next(new HttpError("Something went wrong, could not fetch data", 500));
  }
};

const getQuickSearchResults = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm;
    if (!searchTerm) {
      return res.json({ data: [] });
    }

    const cars = await Car.find({ $text: { $search: searchTerm } });

    const stores = await Store.find({
      name: { $regex: searchTerm, $options: "i" },
    });

    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
    });

    res.status(200).json({
      data: { cars: cars || [], stores: stores || [], users: users || [] },
    });
  } catch (error) {
    next(
      new HttpError("Could not fetch quick results for the search term", 400)
    );
  }
};

const createCar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const imageFiles = req.files;
    const userStoreId = req.body.store;

    const imageUrls = uploadImages(imageFiles, "cars");

    const carData = {
      ...req.body,
      user: userId,
      images: imageUrls,
    };

    if (userStoreId) {
      carData.store = userStoreId;
    }

    const newCar = await Car.create(carData);
    res.status(201).json({
      message: "Car created successfully",
      car: newCar,
    });
  } catch (error) {
    next(new HttpError("Something went wrong, could  not create car", 500));
  }
};

const updateCar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const carId = req.params.carId;
    const imageFiles = req.files;
    const { existingImages = [] } = req.body;

    const car = await Car.findById(carId);
    if (!car) throw new HttpError("Car not found", 404);
    if (car.user.toString() !== userId)
      throw new HttpError("Not authorized", 403);

    const imagesToRemove = car.images.filter(
      (imgUrl) => !existingImages.includes(imgUrl)
    );
    await deleteImages(imagesToRemove, "cars");

    const newImageUrls = await uploadImages(imageFiles, "cars");
    const finalImageUrls = [...existingImages, ...newImageUrls];

    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      {
        ...req.body,
        images: finalImageUrls,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Car updated successfully",
      car: updatedCar,
    });
  } catch (error) {
    next(new HttpError("Faild to update a car", 500));
  }
};

const deleteCar = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const userId = req.user.id;
    const car = await Car.findOneAndDelete({ _id: carId, user: userId });

    if (!car) {
      return next(new HttpError("Car not found or unauthorized", 404));
    }

    const carImagesPaths = car.images.map((imageUrl) => {
      return imageUrl.split(`/object/public/${bucket}/`)[1];
    });
    await deleteImages(carImagesPaths, "cars");

    res.status(200).json({ message: "Car deleted successfully", data: car });
  } catch (error) {
    next(
      new HttpError(
        error.message || "Something went wrong, could not delete car",
        500
      )
    );
  }
};

const compareCars = async (req, res, next) => {
  try {
    const idsAsString = req.query.id;
    if (!idsAsString) {
      return next(new HttpError("No car IDs provided", 400));
    }

    const idsArray = idsAsString.split(",");

    const cars = await Car.find({ _id: { $in: idsArray } })
      .populate("basicInfo.brand", "name")
      .populate("basicInfo.model", "name");

    if (cars.length === 0) {
      return next(new HttpError("No cars found for the given IDs", 404));
    }

    res.status(200).json({ data: cars });
  } catch (error) {
    next(new HttpError("Failed to fetch cars for comparison", 500));
  }
};

export {
  getAllCars,
  getCarById,
  getQuickSearchResults,
  createCar,
  updateCar,
  deleteCar,
  compareCars,
};
