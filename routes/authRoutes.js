import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.get("/signup", (req, res) => res.render("signup", { message: "" }));

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.render("signup", { message: "User already exists" });

  await User.create({ username, password });
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login", { message: req.query.message || "" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res.redirect("/login?message=Invalid credentials");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  user.currentToken = token;
  await user.save();

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect("/dashboard");
});

router.get("/logout", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { currentToken: null });
  } catch (err) {
    console.error("Error during logout:", err);
  }

  res.clearCookie("token");
  res.redirect("/login?message=Logged out");
});

export default router;
