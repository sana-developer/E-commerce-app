import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
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
        _id: false, // Disable _id for subdocuments
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
reviewSchema.index({ product: 1, user: 1 }, { unique: true }) // One review per user per product
reviewSchema.index({ product: 1, createdAt: -1 })
reviewSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model("Review", reviewSchema)
