import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_APP_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
  });

  const verifyUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;
  const html = `
    <p>Please verify your email:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
  `;

  try {
    const res = await transporter.sendMail({
      from: process.env.EMAIL_APP_USER,
      to: email,
      subject: "Verify your email",
      html,
    });
  } catch (err) {
    throw new Error("Verification email failed");
  }
};
