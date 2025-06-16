import jwt from "jsonwebtoken"
import User from "../models/User.js"

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization")

    if (!authHeader) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    // Check if it starts with 'Bearer '
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format. Use 'Bearer <token>'" })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Add user to request
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    console.log("Auth successful for user:", req.user.userId)
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }

    res.status(500).json({ message: "Server error in authentication" })
  }
}

export default auth
