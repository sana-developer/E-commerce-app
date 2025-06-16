"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { productsAPI, categoriesAPI } from "../services/api"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import { useCart } from "../contexts/CardContext"

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { addToCart } = useCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const handleAddToCart = async (product: any) => {
    setAddingToCart(product._id)
    addToCart(product)
    setTimeout(() => setAddingToCart(null), 1000)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getProducts({ limit: 8, sortBy: "createdAt", sortOrder: "desc" }),
          categoriesAPI.getCategories(),
        ])
        setFeaturedProducts(productsRes.data.products || [])
        setCategories(categoriesRes.data.categories || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        // Set empty arrays on error to prevent crashes
        setFeaturedProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Latest trending
                <br />
                Electronic items
              </h1>
              <p className="text-xl mb-8 opacity-90">Discover the newest technology and gadgets at unbeatable prices</p>
              <Link
                to="/products"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Learn more
              </Link>
            </div>
            <div className="relative animate-slide-up">
              <img
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Electronic devices"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Deals and Offers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Deals and offers</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">13</div>
                <div className="text-gray-500">Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">34</div>
                <div className="text-gray-500">Min</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">56</div>
                <div className="text-gray-500">Sec</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredProducts || []).slice(0, 4).map((product: any) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={
                      product.images[0]?.url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    -25%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      <span className="text-sm text-gray-500 line-through">${(product.price * 1.33).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0 || addingToCart === product._id}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {addingToCart === product._id ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
              View all
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories || []).slice(0, 6).map((category: any) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <img
                    src={
                      category.image?.url ||
                      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={category.name}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                </div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recommended items</h2>
            <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
              View all
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredProducts || []).map((product: any) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link to={`/products/${product._id}`}>
                  <img
                    src={
                      product.images[0]?.url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating) ? "fill-current" : "text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-1">({product.numReviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0 || addingToCart === product._id}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {addingToCart === product._id ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">An easy way to send requests to all suppliers</h2>
          <p className="text-xl mb-8 opacity-90">Get quotes from multiple suppliers with just one request</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Send inquiry
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePage
