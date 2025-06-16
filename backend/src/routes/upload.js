import express from "express"
import auth from "../middleware/auth.js"
import adminAuth from "../middleware/adminAuth.js"
import Product from "../models/Product.js"
import Category from "../models/Category.js"
import Review from "../models/Review.js"
import User from "../models/User.js"
import {
  getUploadAvatar,
  getUploadProduct,
  getUploadReview,
  deleteFromCloudinary,
  getOptimizedImageUrl,
} from "../config/cloudinary.js"

const router = express.Router()

// Upload avatar and update user
router.post("/avatar", auth, (req, res) => {
  const uploadAvatar = getUploadAvatar()

  uploadAvatar.single("avatar")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      // Update user's avatar in database
      const user = await User.findByIdAndUpdate(req.user.userId, { avatar: req.file.path }, { new: true }).select(
        "-password",
      )

      res.json({
        message: "Avatar uploaded and updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Avatar upload error:", error)
      res.status(500).json({ message: "Error uploading avatar", error: error.message })
    }
  })
})

// Upload product images for specific product
router.post("/product/:productId", [auth, adminAuth], (req, res) => {
  const uploadProduct = getUploadProduct()

  uploadProduct.array("images", 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      const { productId } = req.params

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" })
      }

      // Check if product exists
      const product = await Product.findById(productId)
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
        alt: req.body.alt || product.name,
      }))

      // Add new images to existing images
      product.images = [...product.images, ...newImages]
      await product.save()

      res.json({
        message: "Product images uploaded successfully",
        product: {
          id: product._id,
          name: product.name,
          images: product.images,
        },
      })
    } catch (error) {
      console.error("Product images upload error:", error)
      res.status(500).json({ message: "Error uploading product images", error: error.message })
    }
  })
})

// Upload review images for specific review
router.post("/review/:reviewId", auth, (req, res) => {
  const uploadReview = getUploadReview()

  uploadReview.array("images", 5)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      const { reviewId } = req.params

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" })
      }

      // Check if review exists and belongs to user
      const review = await Review.findOne({
        _id: reviewId,
        user: req.user.userId,
      })

      if (!review) {
        return res.status(404).json({ message: "Review not found or unauthorized" })
      }

      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }))

      // Add new images to existing images
      review.images = [...review.images, ...newImages]
      await review.save()

      res.json({
        message: "Review images uploaded successfully",
        review: {
          id: review._id,
          images: review.images,
        },
      })
    } catch (error) {
      console.error("Review images upload error:", error)
      res.status(500).json({ message: "Error uploading review images", error: error.message })
    }
  })
})

// Upload category image for specific category
router.post("/category/:categoryId", [auth, adminAuth], (req, res) => {
  const uploadProduct = getUploadProduct() // Reuse product upload config

  uploadProduct.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      const { categoryId } = req.params

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      // Check if category exists
      const category = await Category.findById(categoryId)
      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      // Delete old image if exists
      if (category.image && category.image.publicId) {
        try {
          await deleteFromCloudinary(category.image.publicId)
        } catch (deleteError) {
          console.error("Error deleting old category image:", deleteError)
        }
      }

      // Update category with new image
      category.image = {
        url: req.file.path,
        publicId: req.file.filename,
        alt: category.name,
      }

      await category.save()

      res.json({
        message: "Category image uploaded successfully",
        category: {
          id: category._id,
          name: category.name,
          image: category.image,
        },
      })
    } catch (error) {
      console.error("Category image upload error:", error)
      res.status(500).json({ message: "Error uploading category image", error: error.message })
    }
  })
})

// Delete specific image from entity
router.delete("/:entityType/:entityId/image/:publicId", auth, async (req, res) => {
  try {
    const { entityType, entityId, publicId } = req.params

    if (!publicId) {
      return res.status(400).json({ message: "Public ID is required" })
    }

    const decodedPublicId = decodeURIComponent(publicId)
    let entity
    let Model

    // Determine which model to use
    switch (entityType) {
      case "product":
        Model = Product
        break
      case "review":
        Model = Review
        break
      case "category":
        Model = Category
        break
      default:
        return res.status(400).json({ message: "Invalid entity type" })
    }

    // Find the entity
    if (entityType === "review") {
      entity = await Model.findOne({ _id: entityId, user: req.user.userId })
    } else if (entityType === "product" || entityType === "category") {
      // Check if user is admin for products and categories
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" })
      }
      entity = await Model.findById(entityId)
    }

    if (!entity) {
      return res.status(404).json({ message: `${entityType} not found or unauthorized` })
    }

    // Remove image from entity
    if (entityType === "category") {
      entity.image = null
    } else {
      entity.images = entity.images.filter((img) => img.publicId !== decodedPublicId)
    }

    await entity.save()

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(decodedPublicId)

    if (result.result === "ok") {
      res.json({ message: "Image deleted successfully" })
    } else {
      res.status(404).json({ message: "Image not found or already deleted" })
    }
  } catch (error) {
    console.error("Image deletion error:", error)
    res.status(500).json({ message: "Error deleting image", error: error.message })
  }
})

// Get optimized image URL
router.post("/optimize", (req, res) => {
  try {
    const { url, width, height, crop, quality, format } = req.body

    if (!url) {
      return res.status(400).json({ message: "Image URL is required" })
    }

    const optimizedUrl = getOptimizedImageUrl(url, {
      width,
      height,
      crop,
      quality,
      format,
    })

    res.json({
      originalUrl: url,
      optimizedUrl,
    })
  } catch (error) {
    console.error("Image optimization error:", error)
    res.status(500).json({ message: "Error optimizing image", error: error.message })
  }
})

export default router
