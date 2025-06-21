import express from "express";
import {
  getBrandsAndStoresWithCarCount,
  getGroupedModels,
} from "../controllers/brand-controller.js";

const router = express.Router();

router.get("/brands-stores", getBrandsAndStoresWithCarCount);
router.get("/grouped-models", getGroupedModels);

export default router;
