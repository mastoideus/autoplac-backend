import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["private_seller", "store_seller"],
    default: "private_seller",
  },
  phone: { type: String, required: false },
  city: { type: String, required: false },
  isVerified: { type: Boolean, required: false, default: false },
  profileImage: { type: String, required: false },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: false,
      default: [],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
