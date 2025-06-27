import express from "express";
import mongoose from "mongoose";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

await mongoose.connect("mongodb://localhost:27017/singleTabLogin");

app.use(authRoutes);

app.get("/", (req, res) => res.redirect("/login"));

app.get("/dashboard", authenticateToken, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
