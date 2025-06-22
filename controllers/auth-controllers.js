import User from "../models/User.js";
import HttpError from "../utils/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateWithZod } from "../utils/zod/validateWithZod.js";
import {
  changePasswordSchema,
  loginPayloadSchema,
  registerPayloadSchema,
} from "../utils/zod/schemas.js";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const validatedPayload = validateWithZod(registerPayloadSchema, {
      username,
      email,
      password,
    });
    if (!validatedPayload.success) {
      return res.status(401).json({
        message: "Invalid credentials",
        error: validatedPayload.error,
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return next(
        new HttpError("User with given email or username already exists", 409)
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userObj = {
      username,
      email,
      password: hashedPassword,
    };
    const user = await User.create(userObj);

    const verifyEmailToken = jwt.sign(
      { id: user._id, username, email },
      process.env.VERIFY_EMAIL_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await sendVerificationEmail(email, verifyEmailToken);
    const { password: userPassword, ...userData } = user._doc;
    res.status(201).json({
      message: "User successfully registered, please verify your email",
      data: userData,
    });
  } catch (error) {
    next(new HttpError("Could not register user, please try again", 400));
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const validatedPayload = validateWithZod(loginPayloadSchema, {
      username,
      password,
    });
    if (!validatedPayload.success) {
      return res.status(401).json({
        message: "Invalid credentials",
        error: validatedPayload.error,
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return next(new HttpError("No user with given username", 404));
    }

    if (!user.isVerified) {
      return next(new HttpError("Verify your email before logging in", 403));
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return next(new HttpError("Wrong password, try again", 401));
    }

    const accessToken = jwt.sign(
      { username, id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { username, id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Lax", // ← Change this
      secure: false, // ← Use true in production with HTTPS
      maxAge: 24 * 7 * 60 * 60 * 1000,
    });

    const { password: userPassword, ...userData } = user._doc;

    res.status(200).json({
      message: "Logged in successfully",
      user: userData,
      accessToken,
    });
  } catch (error) {
    next(new HttpError("Something went wrong", 500));
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const validatedPayload = validateWithZod(changePasswordSchema, {
      oldPassword,
      newPassword,
    });
    if (!validatedPayload.success) {
      return res.status(401).json({
        message: "Invalid credentials",
        error: validatedPayload.error,
      });
    }

    if (oldPassword === newPassword) {
      return next(
        new HttpError("New password must be different from the old one", 400)
      );
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new HttpError("Found no user with the given username"), 404);
    }

    const verifiedPassword = await bcrypt.compare(oldPassword, user.password);

    if (!verifiedPassword) {
      return next(new HttpError("The old provided password is incorrect"));
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(new HttpError("Something went wrong", 500));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const verifyEmailToken = req.query.token;
    const decodedEmailToken = jwt.verify(
      verifyEmailToken,
      process.env.VERIFY_EMAIL_TOKEN_SECRET
    );
    const user = await User.findById(decodedEmailToken.id);
    if (!user) {
      return next(new HttpError("Invalid token", 400));
    }
    user.isVerified = true;
    await user.save();
    res.redirect("http://localhost:5173/login?verified=true");
  } catch (error) {
    next(new HttpError("Invalid or expired token", 400));
  }
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new HttpError("No user found with this email", 404));
  }
  if (user.isVerified) {
    return next(new HttpError("Email is already verified", 400));
  }

  const verifyEmailToken = jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.VERIFY_EMAIL_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  await sendVerificationEmail(email, verifyEmailToken);
  res.status(200).json({ message: "Verification email resend" });
};

const generateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    console.log(refreshToken);
    console.log("All cookies:", req.cookies);
    if (!refreshToken) return next(new HttpError("Unauthorized access", 401));

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new HttpError("User not found", 404));

    const newAccessToken = jwt.sign(
      { username: user.username, id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    console.log("new access token:", newAccessToken);
    res.status(200).json({
      message: "New access token generated",
      accessToken: newAccessToken,
    });
  } catch (error) {
    return next(new HttpError("Invalid or expired refresh token", 403));
  }
};

const logoutUser = async (req, res, next) => {
  console.log("Incoming cookies:", req.cookies);
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    return res.status(200).json({ message: "Uspješno ste se odjavili" });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  generateRefreshToken,
};
