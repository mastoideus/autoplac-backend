import CarBrand from "../models/CarBrand.js";
import HttpError from "../utils/HttpError.js";
import Car from "../models/Car.js";

const getBrandsAndStoresWithCarCount = async (req, res, next) => {
  try {
    const brandsWithCount = await Car.aggregate([
      {
        $group: {
          _id: "$basicInfo.brand",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "carbrands",
          localField: "_id",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: "$brand",
      },
      {
        $project: {
          _id: "$brand._id",
          name: "$brand.name",
          logo: "$brand.logo",
          count: 1,
        },
      },
    ]);

    const storesWithCounts = await Car.aggregate([
      {
        $group: {
          _id: "$store",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: "$store" },
      {
        $project: {
          _id: "$store._id",
          name: "$store.name",
          logo: "$store.logo",
          count: 1,
        },
      },
    ]);

    res
      .status(200)
      .json({ data: { brands: brandsWithCount, stores: storesWithCounts } });
  } catch (error) {
    next(
      new HttpError("Could not fetch brands and stores with car count", 500)
    );
  }
};

const getGroupedModels = async (req, res) => {
  try {
    const groupedModelsWithBrandData = await CarBrand.aggregate([
      {
        $lookup: {
          from: "carmodels",
          localField: "_id",
          foreignField: "brand",
          as: "models",
        },
      },
      {
        $match: {
          "models.0": { $exists: true },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          options: {
            $map: {
              input: "$models",
              as: "model",
              in: {
                label: "$$model.name",
                value: { $toString: "$$model._id" },
              },
            },
          },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: groupedModelsWithBrandData,
    });
  } catch (error) {
    console.error("Error fetching grouped models:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { getBrandsAndStoresWithCarCount, getGroupedModels };
