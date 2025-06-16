import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { connectDB } from "./config/db.js"
import { initializeCloudinary } from "./config/cloudinary.js"

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPaths = [
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, ".env"),
  path.join(process.cwd(), ".env"),
  ".env",
]

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    break
  }
}

// Initialize Cloudinary
initializeCloudinary()

// Import routes
import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/products.js"
import cartRoutes from "./routes/cart.js"
import orderRoutes from "./routes/orders.js"
import categoryRoutes from "./routes/categories.js"
import reviewRoutes from "./routes/reviews.js"

const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running!",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/reviews", reviewRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message)

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" })
  }

  if (err.message === "Only image files are allowed!") {
    return res.status(400).json({ message: "Only image files are allowed" })
  }

  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5001

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("Database connection failed:", error)
    process.exit(1)
  })

export default app
