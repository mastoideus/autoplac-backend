const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    description: { type: String },
    heroImage: { type: String },
    logo: { type: String },
    location: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Store", storeSchema);
