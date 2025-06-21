import User from "../models/User.js";

export const cleanupUnverifiedUsers = async () => {
  const relevantTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await User.deleteMany({
    isVerified: false,
    createdAt: { $lt: relevantTime },
  });
};
