import mongoose from "mongoose";
import dotenv from "dotenv";
import { brandsWithModels } from "./brandsWithModelsData.js";
import CarBrand from "../models/CarBrand.js";
import CarModel from "../models/CarModel.js";

dotenv.config();

const createModelBrandData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const { name, models } of brandsWithModels) {
      const brandDoc = await CarBrand.create({ name });

      const modelDocs = models.map((model) => {
        return {
          name: model,
          brand: brandDoc._id,
        };
      });

      await CarModel.create(modelDocs);
    }
    console.log("brands and models seeded!");
    process.exit(0);
  } catch (error) {
    console.error("seeding failed:", err);
    process.exit(1);
  }
};

createModelBrandData();
