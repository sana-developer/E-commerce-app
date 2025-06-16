import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      // Will be auto-generated if not provided
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
productSchema.index({ name: "text", description: "text" })
productSchema.index({ category: 1 })
productSchema.index({ price: 1 })
productSchema.index({ averageRating: -1 })
productSchema.index({ createdAt: -1 })

export default mongoose.model("Product", productSchema)
