const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  basicInfo: {
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true, index: true },
    mileage: { type: Number },
    description: { type: String },
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
      type: String,
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
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

carSchema.index({ "basicInfo.brand": 1 });
carSchema.index({ "basicInfo.model": 1 });
carSchema.index({ "basicInfo.price": 1 });
carSchema.index({ "basicInfo.model": "text", "basicInfo.brand": "text" });

module.exports = mongoose.model("Car", carSchema);
