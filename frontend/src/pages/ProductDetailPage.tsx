"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { productsAPI, reviewsAPI } from "../services/api"
import { useCart } from "../contexts/CardContext"
import { useAuth } from "../contexts/AuthContext"
import { StarIcon, HeartIcon, ShareIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import toast from "react-hot-toast"

const ProductDetailPage = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    images: [] as File[],
  })

  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchReviews()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProduct(id!)
      setProduct(response.data)
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Product not found")
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getProductReviews(id!)
      setReviews(response.data.reviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const handleAddToCart = async () => {
    if (product) {
      setAddingToCart(true)
      addToCart(product, quantity)
      setTimeout(() => setAddingToCart(false), 1000)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to submit a review")
      return
    }

    try {
      await reviewsAPI.createReview(id!, reviewForm.rating, reviewForm.comment, reviewForm.images)
      toast.success("Review submitted successfully!")
      setShowReviewForm(false)
      setReviewForm({ rating: 5, comment: "", images: [] })
      fetchReviews()
      fetchProduct() // Refresh to update average rating
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/products" className="text-blue-600 hover:text-blue-800">
            Back to products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-gray-400 hover:text-gray-500">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <Link to="/products" className="text-gray-400 hover:text-gray-500">
                Products
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={
                  product.images[selectedImage]?.url ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" ||
                  "/placeholder.svg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">SKU: {product.sku}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) =>
                  i < Math.floor(product.averageRating) ? (
                    <StarIconSolid key={i} className="h-5 w-5" />
                  ) : (
                    <StarIcon key={i} className="h-5 w-5" />
                  ),
                )}
              </div>
              <span className="text-sm text-gray-600">
                {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-gray-900">${product.price}</div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Specifications */}
            {Object.keys(product.specifications || {}).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Specifications</h3>
                <dl className="grid grid-cols-1 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-medium text-gray-900 capitalize">{key}:</dt>
                      <dd className="text-gray-600">{value as string}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  disabled={product.stock === 0}
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {addingToCart ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding to Cart...
                    </div>
                  ) : product.stock === 0 ? (
                    "Out of Stock"
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <HeartIcon className="h-6 w-6 text-gray-600" />
                </button>

                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <ShareIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-8 p-4 border border-gray-200 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-yellow-400 hover:text-yellow-500"
                      >
                        {star <= reviewForm.rating ? (
                          <StarIconSolid className="h-6 w-6" />
                        ) : (
                          <StarIcon className="h-6 w-6" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                    Images (optional)
                  </label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={(e) => setReviewForm({ ...reviewForm, images: Array.from(e.target.files || []) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review: any) => (
                <div key={review._id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        review.user.avatar ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80" ||
                        "/placeholder.svg"
                      }
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) =>
                            i < review.rating ? (
                              <StarIconSolid key={i} className="h-4 w-4" />
                            ) : (
                              <StarIcon key={i} className="h-4 w-4" />
                            ),
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{review.comment}</p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2">
                          {review.images.map((image: any, index: number) => (
                            <img
                              key={index}
                              src={image.url || "/placeholder.svg"}
                              alt={`Review image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
