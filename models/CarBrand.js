import mongoose from "mongoose";

const CarBrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: { type: String, required: true },
});

export default mongoose.model("CarBrand", CarBrandSchema);
