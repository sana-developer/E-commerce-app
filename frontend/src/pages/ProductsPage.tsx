"use client"

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { productsAPI, categoriesAPI } from "../services/api"
import { useCart } from "../contexts/CardContext"
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline"

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchParams, selectedCategories, priceRange, sortBy, sortOrder])

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: searchParams.get("page") || 1,
        limit: 12,
        sortBy,
        sortOrder,
      }

      if (searchParams.get("search")) {
        params.search = searchParams.get("search")
      }

      if (searchParams.get("category")) {
        params.category = searchParams.get("category")
      }

      if (selectedCategories.length > 0) {
        params.category = selectedCategories[0] // For simplicity, using first selected category
      }

      if (priceRange.min) params.minPrice = priceRange.min
      if (priceRange.max) params.maxPrice = priceRange.max

      const response = await productsAPI.getProducts(params)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange({ min: "", max: "" })
    setSearchParams({})
  }

  const ProductCard = ({ product }: { product: any }) => {
    const [addingToCart, setAddingToCart] = useState<string | null>(null)

    const handleAddToCart = async (product: any) => {
      setAddingToCart(product._id)
      addToCart(product)
      // Small delay to show the feedback
      setTimeout(() => setAddingToCart(null), 1000)
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={`/products/${product._id}`} className="block">
          <div className="relative">
            <img
              src={
                product.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt={product.name || "Product"}
              className="w-full h-48 object-cover"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">{product.name}</h3>
          </Link>

          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.averageRating || 0) ? "fill-current" : "text-gray-300"}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">
              {(product.averageRating || 0).toFixed(1)} • {product.numReviews || 0} orders
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">${product.price || 0}</span>
              {(product.stock || 0) > 0 && <div className="text-sm text-green-600 font-medium">Free Shipping</div>}
            </div>

            <button
              onClick={() => handleAddToCart(product)}
              disabled={(product.stock || 0) === 0 || addingToCart === product._id}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {addingToCart === product._id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Adding...
                </div>
              ) : (product.stock || 0) === 0 ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            {searchParams.get("search") && (
              <p className="text-gray-600 mt-1">Search results for "{searchParams.get("search")}"</p>
            )}
          </div>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-")
                setSortBy(field)
                setSortOrder(order)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="createdAt-desc">Newest</option>
              <option value="createdAt-asc">Oldest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="averageRating-desc">Highest Rated</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600"}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600"}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {(categories || []).map((category: any) => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryToggle(category._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {(products || []).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                }`}
              >
                {(products || []).map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
