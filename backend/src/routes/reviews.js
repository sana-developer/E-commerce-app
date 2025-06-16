import express from "express"
import Review from "../models/Review.js"
import Product from "../models/Product.js"
import auth from "../middleware/auth.js"
import { getUploadReview, deleteFromCloudinary } from "../config/cloudinary.js"

const router = express.Router()

// Get all reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Review.countDocuments({ product: req.params.productId })

    res.json({
      reviews,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalReviews: total,
        hasNext: skip + reviews.length < total,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get reviews error:", error)
    res.status(500).json({ message: "Error fetching reviews" })
  }
})

// Get user's reviews
router.get("/user", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const reviews = await Review.find({ user: req.user.userId })
      .populate("product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Review.countDocuments({ user: req.user.userId })

    res.json({
      reviews,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalReviews: total,
        hasNext: skip + reviews.length < total,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get user reviews error:", error)
    res.status(500).json({ message: "Error fetching user reviews" })
  }
})

// Create review with optional images
router.post("/", auth, (req, res) => {

  const uploadReview = getUploadReview()

  uploadReview.array("images", 5)(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err)
      return res.status(400).json({ message: err.message })
    }

    try {
      const { product, rating, comment } = req.body

      // Check authentication first
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Authentication required. Please login." })
      }

      // Validation - only require essential fields
      if (!product || !rating) {
        return res.status(400).json({ message: "Product and rating are required" })
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" })
      }

      // Check if product exists
      const productExists = await Product.findById(product)
      if (!productExists) {
        return res.status(404).json({ message: "Product not found" })
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        user: req.user.userId,
        product,
      })

      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" })
      }

      // Process uploaded images (optional)
      const images =
        req.files && req.files.length > 0
          ? req.files.map((file) => ({
              url: file.path,
              publicId: file.filename,
            }))
          : [] // Empty array if no images uploaded

      const reviewData = {
        user: req.user.userId,
        product,
        rating: Number.parseInt(rating),
        comment: comment || "",
        images, // This should be an array of objects
      }

      const review = new Review(reviewData)

      await review.save()
      await review.populate("user", "name avatar")
      await review.populate("product", "name")

      // Update product's average rating
      await updateProductRating(product)

      res.status(201).json({
        message: `Review created successfully${images.length > 0 ? ` with ${images.length} image(s)` : " (no images)"}`,
        review,
      })
    } catch (error) {
      console.error("Create review error:", error)
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        errors: error.errors,
      })
      res.status(500).json({ message: "Error creating review" })
    }
  })
})

// Update review
router.put("/:id", auth, async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required. Please login." })
    }

    const { rating, comment } = req.body

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })

    if (!review) {
      return res.status(404).json({ message: "Review not found or unauthorized" })
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" })
      }
      review.rating = Number.parseInt(rating)
    }

    if (comment !== undefined) {
      review.comment = comment
    }

    await review.save()
    await review.populate("user", "name avatar")
    await review.populate("product", "name")

    // Update product's average rating
    await updateProductRating(review.product._id)

    res.json({
      message: "Review updated successfully",
      review,
    })
  } catch (error) {
    console.error("Update review error:", error)
    res.status(500).json({ message: "Error updating review" })
  }
})

// Add images to existing review
router.post("/:id/images", auth, (req, res) => {
  // Check authentication
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: "Authentication required. Please login." })
  }

  const uploadReview = getUploadReview()

  uploadReview.array("images", 5)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" })
      }

      const review = await Review.findOne({
        _id: req.params.id,
        user: req.user.userId,
      })

      if (!review) {
        return res.status(404).json({ message: "Review not found or unauthorized" })
      }

      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }))

      review.images = [...review.images, ...newImages]
      await review.save()

      res.json({
        message: "Images added successfully",
        review,
      })
    } catch (error) {
      console.error("Add images error:", error)
      res.status(500).json({ message: "Error adding images" })
    }
  })
})

// Delete review
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required. Please login." })
    }

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })

    if (!review) {
      return res.status(404).json({ message: "Review not found or unauthorized" })
    }

    const productId = review.product
    await Review.findByIdAndDelete(req.params.id)

    // Update product's average rating
    await updateProductRating(productId)

    // Delete images from Cloudinary
    for (const image of review.images) {
      await deleteFromCloudinary(image.publicId);
    }

    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Delete review error:", error)
    res.status(500).json({ message: "Error deleting review" })
  }
})

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId })

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0,
      })
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      numReviews: reviews.length,
    })
  } catch (error) {
    console.error("Error updating product rating:", error)
  }
}

export default router
