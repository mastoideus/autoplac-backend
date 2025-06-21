import mongoose from "mongoose";
import dotenv from "dotenv";
import Car from "../models/Car.js";
import CarBrand from "../models/CarBrand.js";
import CarModel from "../models/CarModel.js";
dotenv.config();

const cities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "Charlotte",
  "San Francisco",
  "Indianapolis",
  "Seattle",
  "Denver",
  "Washington",
];

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];
const transmissions = ["Manual", "Automatic"];

function randomUserId() {
  return new mongoose.Types.ObjectId();
}

async function seedCars() {
  await mongoose.connect(process.env.MONGODB_URI);

  const brands = await CarBrand.find();
  const models = await CarModel.find();

  if (brands.length === 0 || models.length === 0) {
    console.error("Seed brands and models first!");
    process.exit(1);
  }

  const carsData = [];

  for (let i = 0; i < 20; i++) {
    const brand = brands[i % brands.length];

    const modelsOfBrand = models.filter(
      (m) => m.brand.toString() === brand._id.toString()
    );
    const model =
      modelsOfBrand.length > 0
        ? modelsOfBrand[i % modelsOfBrand.length]
        : models[0];

    const city = cities[i % cities.length];

    carsData.push({
      basicInfo: {
        brand: brand._id,
        model: model._id,
        city,
        year: 2010 + (i % 10),
        price: 10000 + i * 1500,
        mileage: 30000 + i * 5000,
        description: `A nice ${brand.name} ${model.name} from ${city}`,
      },
      mechanics: {
        fuelType: fuelTypes[i % fuelTypes.length],
        transmission: transmissions[i % transmissions.length],
        engine: {
          capacityCC: 1400 + i * 100,
          power: {
            hp: 90 + i * 10,
            kw: 67 + i * 7,
          },
          cylinders: 4,
          turbo: i % 2 === 0,
        },
        drivetrain: i % 2 === 0 ? "FWD" : "AWD",
        emissions: {
          co2: 110 - i,
          euroStandard: "Euro 6",
        },
      },
      appearance: {
        color: i % 2 === 0 ? "Black" : "White",
        bodyType: "Sedan",
        doors: 4,
        seats: 5,
        wheels: {
          sizeInches: 16 + (i % 3),
          type: "Alloy",
        },
      },
      features: {
        airConditioning: true,
        navigationSystem: i % 2 === 0,
        heatedSeats: i % 3 === 0,
        bluetooth: true,
        parkingSensors: i % 2 === 0,
        cruiseControl: true,
        sunroof: i % 4 === 0,
        airbags: 6,
        abs: true,
        tractionControl: true,
      },
      ownership: {
        numberOfOwners: 1 + (i % 3),
        registrationDate: new Date(2015, i % 12, i + 1),
        inspectionValidUntil: new Date(2025, i % 12, i + 1),
        warranty: i % 2 === 0,
      },
      location: {
        city,
        region: "Region " + ((i % 5) + 1),
      },
      images: [`car${i + 1}.jpg`],
      user: randomUserId(),
      createdAt: new Date(),
    });
  }

  await Car.insertMany(carsData);
  console.log("Seeded 20 cars without stores, with random user IDs!");
  await mongoose.disconnect();
}

seedCars().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
