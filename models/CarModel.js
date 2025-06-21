import mongoose from "mongoose";

const CarModelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarBrand",
    required: true,
  },
});

export default mongoose.model("CarModel", CarModelSchema);
