import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  generateRefreshToken,
} from "../controllers/auth-controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-pass", authMiddleware, changePassword);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);
router.get("/refresh", generateRefreshToken);

export default router;
