import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
  basicInfo: {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarBrand",
      required: true,
    },
    brandName: { type: String, required: true },
    status: [String],
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarModel",
      required: true,
    },
    modelName: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true, index: true },
    mileage: { type: Number },
    description: { type: String },
    type: {
      type: String,
      enum: [
        "kupe",
        "kabriolet",
        "hatchback",
        "kombi",
        "ostalo",
        "monovolumen",
        "suv",
        "limuzina",
        "karavan",
      ],
    },
  },
  mechanics: {
    fuelType: { type: String },
    transmission: { type: String },
    engine: {
      capacityCC: Number,
      power: {
        hp: Number,
        kw: Number,
      },
      cylinders: Number,
      turbo: Boolean,
    },
    drivetrain: { type: String },
    emissions: {
      co2: Number,
      euroStandard: String,
    },
  },
  appearance: {
    color: String,
    bodyType: String,
    doors: Number,
    seats: Number,
    wheels: {
      sizeInches: Number,
      wheelType: String,
    },
  },
  features: {
    airConditioning: Boolean,
    navigationSystem: Boolean,
    heatedSeats: Boolean,
    bluetooth: Boolean,
    parkingSensors: Boolean,
    cruiseControl: Boolean,
    sunroof: Boolean,
    airbags: Number,
    abs: Boolean,
    tractionControl: Boolean,
  },
  ownership: {
    numberOfOwners: Number,
    registrationDate: Date,
    inspectionValidUntil: Date,
    warranty: Boolean,
  },
  location: {
    city: String,
    region: String,
  },
  images: [String],
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: false,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

CarSchema.pre("save", async function (next) {
  if (this.isModified("basicInfo.brand")) {
    const brand = await mongoose
      .model("CarBrand")
      .findById(this.basicInfo.brand);
    this.basicInfo.brandName = brand?.name || "";
  }

  if (this.isModified("basicInfo.model")) {
    const model = await mongoose
      .model("CarModel")
      .findById(this.basicInfo.model);
    this.basicInfo.modelName = model?.name || "";
  }

  next();
});

CarSchema.index({ "basicInfo.brand": 1 });
CarSchema.index({ "basicInfo.model": 1 });

CarSchema.index({
  "basicInfo.brandName": "text",
  "basicInfo.modelName": "text",
  "basicInfo.description": "text",
});

export default mongoose.model("Car", CarSchema);
