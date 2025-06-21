import mongoose from "mongoose";
import dotenv from "dotenv";
import Car from "../models/Car.js";
import CarBrand from "../models/CarBrand.js";
import CarModel from "../models/CarModel.js";

dotenv.config(); // Load your .env if you're using it

const MONGO_URI = process.env.MONGODB_URI;

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const cars = await Car.find();
    console.log(`Found ${cars.length} cars to update`);

    for (const car of cars) {
      const brand = await CarBrand.findById(car.basicInfo.brand);
      const model = await CarModel.findById(car.basicInfo.model);

      // Add names to the car
      car.basicInfo.brandName = brand?.name || "";
      car.basicInfo.modelName = model?.name || "";

      await car.save();
      console.log(`Updated car: ${car._id}`);
    }

    console.log("Done updating all cars.");
    process.exit(0);
  } catch (err) {
    console.error("Error while updating cars:", err);
    process.exit(1);
  }
};

run();
