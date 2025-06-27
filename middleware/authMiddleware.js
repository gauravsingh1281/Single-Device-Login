import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect("/login?message=Please login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.currentToken !== token) {
      res.clearCookie("token");
      return res.redirect("/login?message=Logged out due to new login");
    }

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/login?message=Session expired, login again");
  }
};
