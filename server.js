import dotenv from "dotenv";
import express from "express";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  console.log("AUTOPLAC API ");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
