import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {connectDB} from "./config/db.js"
import { initializeCloudinary } from "./config/cloudinary.js"

// Import routes
import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/products.js"
import categoryRoutes from "./routes/categories.js"
import reviewRoutes from "./routes/reviews.js"
import orderRoutes from "./routes/orders.js"
import uploadRoutes from "./routes/upload.js"
import inquiryRoutes from "./routes/inquiry.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to database
connectDB()

// Initialize Cloudinary
const cloudinaryInitialized = initializeCloudinary()
if (!cloudinaryInitialized) {
  console.warn("⚠️  Cloudinary not initialized - image uploads will not work")
}

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/inquiry", inquiryRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`)
})
