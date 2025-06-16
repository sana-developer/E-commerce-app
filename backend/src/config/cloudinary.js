import { v2 as cloudinary } from "cloudinary"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"

// Initialize Cloudinary
export const initializeCloudinary = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Cloudinary credentials missing")
    return false
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    return true
  } catch (error) {
    console.error("Cloudinary configuration error:", error)
    return false
  }
}

// Avatar storage configuration
const createAvatarStorage = () =>
  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "ecommerce/avatars",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 300, height: 300, crop: "fill", quality: "auto", fetch_format: "auto" }],
      public_id: (req, file) => {
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        return `avatar_${timestamp}_${randomString}`
      },
    },
  })

// Product storage configuration
const createProductStorage = () =>
  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "ecommerce/products",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 1000, height: 1000, crop: "limit", quality: "auto", fetch_format: "auto" }],
      public_id: (req, file) => {
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        return `product_${timestamp}_${randomString}`
      },
    },
  })

// Review storage configuration
const createReviewStorage = () =>
  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "ecommerce/reviews",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }],
      public_id: (req, file) => {
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        return `review_${timestamp}_${randomString}`
      },
    },
  })

// Create multer upload middleware
let _uploadAvatar, _uploadProduct, _uploadReview

export const getUploadAvatar = () => {
  if (!_uploadAvatar) {
    _uploadAvatar = multer({
      storage: createAvatarStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true)
        } else {
          cb(new Error("Only image files are allowed!"), false)
        }
      },
    })
  }
  return _uploadAvatar
}

export const getUploadProduct = () => {
  if (!_uploadProduct) {
    _uploadProduct = multer({
      storage: createProductStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true)
        } else {
          cb(new Error("Only image files are allowed!"), false)
        }
      },
    })
  }
  return _uploadProduct
}

export const getUploadReview = () => {
  if (!_uploadReview) {
    _uploadReview = multer({
      storage: createReviewStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true)
        } else {
          cb(new Error("Only image files are allowed!"), false)
        }
      },
    })
  }
  return _uploadReview
}

// Utility functions
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw error
  }
}

export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null

  try {
    const matches = url.match(/\/v\d+\/(.+)\./)
    return matches ? matches[1] : null
  } catch (error) {
    return null
  }
}

export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes("cloudinary.com")) return url

  const { width = "auto", height = "auto", crop = "fill", quality = "auto", format = "auto" } = options

  const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`
  return url.replace("/upload/", `/upload/${transformations}/`)
}

export default cloudinary
