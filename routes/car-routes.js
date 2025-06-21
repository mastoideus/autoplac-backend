import express from "express";
import {
  getAllCars,
  getCarById,
  getQuickSearchResults,
  createCar,
  updateCar,
  deleteCar,
  compareCars,
} from "../controllers/car-controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllCars);
router.get("/compare", compareCars);
router.get("/quickSearch", getQuickSearchResults);
router.get("/:carId", getCarById);

router.post("/new", authMiddleware, upload.array("car_images"), createCar);
router.post(
  "/:carId/edit",
  authMiddleware,
  upload.array("car_images"),
  updateCar
);
router.delete("/:carId/delete", authMiddleware, deleteCar);

export default router;
