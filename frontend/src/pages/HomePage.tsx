"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { productsAPI, categoriesAPI, inquiryAPI } from "../services/api"
import { useCart } from "../contexts/CardContext"
import toast from "react-hot-toast"
import NavbarSection from "../components/layout/NavbarSection"

const HomePage = () => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { addToCart } = useCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 13,
    minutes: 34,
    seconds: 56,
  })

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    item: "",
    quantity: "",
    unit: "Pcs",
    email: "",
    message: "",
  })
  const [submittingInquiry, setSubmittingInquiry] = useState(false)

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [subscribingNewsletter, setSubscribingNewsletter] = useState(false)

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          // Reset timer when it reaches 0
          hours = 13
          minutes = 34
          seconds = 56
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAddToCart = async (product: any) => {
    setAddingToCart(product._id)
    addToCart(product)
    setTimeout(() => setAddingToCart(null), 1000)
  }

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`)
  }

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingInquiry(true)

    try {
      await inquiryAPI.submitInquiry(inquiryForm)
      toast.success("Inquiry sent successfully! We'll get back to you soon.")
      setInquiryForm({
        item: "",
        quantity: "",
        unit: "Pcs",
        email: "",
        message: "",
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send inquiry. Please try again.")
    } finally {
      setSubmittingInquiry(false)
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return

    setSubscribingNewsletter(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Successfully subscribed to newsletter!")
      setNewsletterEmail("")
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.")
    } finally {
      setSubscribingNewsletter(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getProducts({ limit: 29, sortOrder: "asc" }),
          categoriesAPI.getCategories(),
        ])
        setFeaturedProducts(productsRes.data.products || [])
        console.log("categories:", categoriesRes)
        console.log("products: ", productsRes)
        setCategories(categoriesRes.data.categories || [])
      } catch (error) {
        console.error("Error fetching data:", error)
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

  // Filter featuredProducts for Home and Outdoor category by ObjectId
  const homeOutdoorProducts = featuredProducts.filter(
    (product) => product.category && product.category._id === "685057c94315074980a6bcfc",
  )

  // Filter featuredProducts for Home and Outdoor category by ObjectId
  const consumerElectronics = featuredProducts.filter(
    (product) => product.category && product.category._id === "685057c94315074980a6bcfd",
  )

  const extraServices = [
    {
      title: "Source from Industry Hubs",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop",
      icon: "🏭",
      link: "/services/sourcing",
    },
    {
      title: "Customize Your Products",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      icon: "🎨",
      link: "/services/customization",
    },
    {
      title: "Fast, reliable shipping by ocean or air",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      icon: "✈️",
      link: "/services/shipping",
    },
    {
      title: "Product monitoring and inspection",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
      icon: "🔍",
      link: "/services/inspection",
    },
  ]

  const supplierRegions = [
    { country: "Arabic Emirates", flag: "🇦🇪", suppliers: "shopname.ae", link: "/suppliers/ae" },
    { country: "Australia", flag: "🇦🇺", suppliers: "shopname.au", link: "/suppliers/au" },
    { country: "United States", flag: "🇺🇸", suppliers: "shopname.us", link: "/suppliers/us" },
    { country: "Russia", flag: "🇷🇺", suppliers: "shopname.ru", link: "/suppliers/ru" },
    { country: "Italy", flag: "🇮🇹", suppliers: "shopname.it", link: "/suppliers/it" },
    { country: "Denmark", flag: "🇩🇰", suppliers: "shopname.dk", link: "/suppliers/dk" },
    { country: "France", flag: "🇫🇷", suppliers: "shopname.fr", link: "/suppliers/fr" },
    { country: "Arabic Emirates", flag: "🇦🇪", suppliers: "shopname.ae", link: "/suppliers/ae" },
    { country: "China", flag: "🇨🇳", suppliers: "shopname.cn", link: "/suppliers/cn" },
    { country: "Great Britain", flag: "🇬🇧", suppliers: "shopname.gb", link: "/suppliers/gb" },
  ]

  return (
    <>
      {/* Mobile Categories Nav - horizontally scrollable, only on small screens */}
      <nav className="block md:hidden w-full overflow-x-auto scrollbar-hide py-2 border-b border-gray-200">
        <div className="flex space-x-2 px-2 min-w-max">
          {[
            { name: "Automobiles", id: "6851bb0bbde28e12d8b5f4c3" },
            { name: "Clothes and wear", id: "6851bb0bbde28e12d8b5f4c4" },
            { name: "Home interiors", id: "6851bb0bbde28e12d8b5f4c5" },
            { name: "Computer and tech", id: "685057c94315074980a6bcfe" },
            { name: "Tools, equipments", id: "6851bb0bbde28e12d8b5f4c7" },
            { name: "Sports and outdoor", id: "6851bb0bbde28e12d8b5f4c8" },
            { name: "Animal and pets", id: "6851bb0bbde28e12d8b5f4c9" },
            { name: "Machinery tools", id: "6851bb0bbde28e12d8b5f4ca" },
            { name: "More category", id: "6851bb0bbde28e12d8b5f4cb" },
          ].map((category) => (
            <a
              key={category.id}
              href={`/products?category=${category.id}`}
              className="whitespace-nowrap block bg-gray-200 text-blue-600 hover:text-blue-800 hover:bg-gray- py-2 px-3 rounded hover:bg-gray-400 border border-gray-100"
            >
              {category.name}
            </a>
          ))}
        </div>
      </nav>

      {/* Navbar section */}
      <NavbarSection />

      <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Main Content with Sidebar */}
        <div className="flex">
          {/* Main Content Area */}
          <div className="flex-1 max-w-full">
            {/* Hero Section with Right Sidebar */}
            <div className="flex md:border-2 md:border-gray-200 rounded-[5px] bg-white my-2 md:my-8 p-4 px-0 md:px-4">
              {/* Left Sidebar */}
              <aside className="hidden lg:block w-64 bg-white shadow-sm">
                <div className="p-4">
                  <nav className="space-y-2">
                    {[
                      { name: "Automobiles", id: "6851bb0bbde28e12d8b5f4c3" },
                      { name: "Clothes and wear", id: "6851bb0bbde28e12d8b5f4c4" },
                      { name: "Home interiors", id: "6851bb0bbde28e12d8b5f4c5" },
                      { name: "Computer and tech", id: "685057c94315074980a6bcfe" },
                      { name: "Tools, equipments", id: "6851bb0bbde28e12d8b5f4c7" },
                      { name: "Sports and outdoor", id: "6851bb0bbde28e12d8b5f4c8" },
                      { name: "Animal and pets", id: "6851bb0bbde28e12d8b5f4c9" },
                      { name: "Machinery tools", id: "6851bb0bbde28e12d8b5f4ca" },
                      { name: "More category", id: "6851bb0bbde28e12d8b5f4cb" },
                    ].map((category) => (
                      <a
                        key={category.id}
                        href={`/products?category=${category.id}`}
                        className="block text-sm text-gray-600 hover:text-blue-600 py-2 px-2 rounded hover:bg-gray-50"
                      >
                        {category.name}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Hero Content */}
              <section
                className="flex-1 bg-cover bg-center text-black py-8 md:py-16"
                style={{ backgroundImage: "url('/main.png')" }}
              >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="animate-fade-in">
                    <h1 className="text-1xl md:text-3xl mb-4 md:mb-6">
                      Latest trending
                      <br />
                      <h1 className="font-bold">Electronic items</h1>
                    </h1>
                    <Link
                      to="/products?category=685057c94315074980a6bcfe"
                      className="inline-block bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>
              </section>

              {/* Right Sidebar */}
              <aside className="hidden xl:block w-80 bg-white shadow-sm">
                <div className="p-4 py-0">
                  {/* User Profile Card */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4 md:py-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Hi, user</p>
                        <p className="text-xs text-gray-600">let's get started</p>
                      </div>
                    </div>
                    <Link to="/register">
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 mb-2">
                      Join now</button>
                    </Link>
                    <Link to="/login">
                      <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Log in</button>
                    </Link>
                  </div>

                  {/* Promotional Cards */}
                  <div className="space-y-3">
                    <div className="bg-orange-100 rounded-lg p-3 md:py-4">
                      <p className="text-sm font-medium text-orange-800">Get US $10 off</p>
                      <p className="text-xs text-orange-600">with a new supplier</p>
                    </div>
                    <div className="bg-teal-100 rounded-lg p-3 md:py-4">
                      <p className="text-sm font-medium text-teal-800">Send quotes with</p>
                      <p className="text-xs text-teal-600">supplier preferences</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-3 md:py-4">
                      <p className="text-sm font-medium text-purple-800">Explore our big</p>
                      <p className="text-xs text-purple-600">offers & deals</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Deals and Offers */}
            <section className="py-8 md:py-0 md:pt-4 bg-white border-2 border-gray-200 rounded-[5px]">
              <div className="mx-auto px-4 sm:px-4 lg:px-4">
                <div className="flex justify-between mb-6 flex-col md:flex-row">
                  <div>
                    <div className="hidden sm:block md:pb-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Deals and offers</h2>
                      <p className="text-gray-600 text-sm">Hygiene equipments</p>
                    </div>
                    <div className="hidden sm:inline-flex flex items-center space-x-2 md:space-x-4 text-sm bg-gray-100 rounded-lg p-2">
                      <div className="text-center bg-gray-800 text-white px-2 py-1 rounded">
                        <div className="text-lg font-bold">{timeLeft.hours.toString().padStart(2, "0")}</div>
                        <div className="text-xs">Hour</div>
                      </div>
                      <div className="text-center bg-gray-800 text-white px-2 py-1 rounded">
                        <div className="text-lg font-bold">{timeLeft.minutes.toString().padStart(2, "0")}</div>
                        <div className="text-xs">Min</div>
                      </div>
                      <div className="text-center bg-gray-800 text-white px-2 py-1 rounded">
                        <div className="text-lg font-bold">{timeLeft.seconds.toString().padStart(2, "0")}</div>
                        <div className="text-xs">Sec</div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Grid */}
                  <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {(featuredProducts || []).slice(0, 5).map((product: any) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleProductClick(product._id)}
                      >
                        <div className="relative">
                          <img
                            src={product.images[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                            -25%
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                          <div className="text-red-500 font-bold text-sm">-25%</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Horizontal Scroll */}
                  <div className="md:hidden sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Deals and offers</h2>
                        <p className="text-gray-600 text-sm">Electronic equipments</p>
                      </div>
                      <div className="flex items-center space-x-2 md:space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg md:text-2xl font-bold text-blue-600">
                            {timeLeft.hours.toString().padStart(2, "0")}
                          </div>
                          <div className="text-gray-500 text-xs">Hour</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg md:text-2xl font-bold text-blue-600">
                            {timeLeft.minutes.toString().padStart(2, "0")}
                          </div>
                          <div className="text-gray-500 text-xs">Min</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg md:text-2xl font-bold text-blue-600">
                            {timeLeft.seconds.toString().padStart(2, "0")}
                          </div>
                          <div className="text-gray-500 text-xs">Sec</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="block md:hidden w-full overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-4 pb-4" style={{ width: "max-content" }}>
                      {(featuredProducts || []).slice(0, 5).map((product: any) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          style={{ minWidth: "140px" }}
                          onClick={() => handleProductClick(product._id)}
                        >
                          <div className="relative">
                            <img
                              src={product.images[0]?.url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                              -25%
                            </div>
                          </div>
                          <div className="p-2">
                            <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">{product.name}</h3>
                            <div className="text-red-500 font-bold text-xs">${product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Home and Outdoor */}
            <section className="my-8 md:my-10 py-4 md:py-6 bg-gray-50 border-2 border-gray-200 rounded-[5px]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Section with Image */}
                  <div className="lg:col-span-1">
                    <div
                      className="rounded-lg p-6 h-full flex flex-col justify-start bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: "url('/section1.png')" }}
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Home and outdoor</h2>
                      <button
                        onClick={() => navigate("/products?category=6851bb0bbde28e12d8b5f4c5")}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm bg-white px-4 py-2 rounded-lg"
                      >
                        Source now
                      </button>
                    </div>
                  </div>

                  {/* Right Grid */}
                  <div className="lg:col-span-3">
                    {/* Desktop Grid */}
                    <div className="hidden md:grid grid-cols-2 md:grid-cols-3 gap-4">
                      {homeOutdoorProducts.slice(0, 6).map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          <img
                            src={product.images[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-2">
                            <h3 className="font-medium text-gray-900 text-xs mb-1">{product.name}</h3>
                            <div className="text-gray-600 text-xs">From</div>
                            <div className="text-gray-600 text-xs">USD {product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile Horizontal Scroll */}
                    <div className="block md:hidden w-full overflow-x-auto scrollbar-hide">
                      <div className="flex space-x-4 pb-4" style={{ width: "max-content" }}>
                        {homeOutdoorProducts.slice(0, 6).map((product) => (
                          <div
                            key={product._id}
                            className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            style={{ minWidth: "140px" }}
                            onClick={() => navigate(`/products/${product._id}`)}
                          >
                            <img
                              src={product.images[0]?.url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="p-2">
                              <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">{product.name}</h3>
                              <div className="text-gray-600 text-xs">From</div>
                              <div className="text-gray-600 text-xs">USD {product.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Consumer Electronics */}
            <section className="py-8 md:py-10 my-6 bg-white border-2 border-gray-200 rounded-[5px]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Section with Image */}
                  <div className="lg:col-span-1">
                    <div
                      className="rounded-lg p-6 h-full flex flex-col justify-start bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: "url('/section2.png')" }}
                    >
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Consumer electronics and gadgets</h2>
                      <button
                        onClick={() => navigate("/products?category=685057c94315074980a6bcfe")}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm bg-white px-4 py-2 rounded-lg"
                      >
                        Source now
                      </button>
                    </div>
                  </div>

                  {/* Right Grid */}
                  <div className="lg:col-span-3">
                    {/* Desktop Grid */}
                    <div className="hidden md:grid grid-cols-2 md:grid-cols-3 gap-4">
                      {consumerElectronics.slice(0, 6).map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          <img
                            src={product.images[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-2">
                            <h3 className="font-medium text-gray-900 text-xs mb-1">{product.name}</h3>
                            <div className="text-gray-600 text-xs">From</div>
                            <div className="text-gray-600 text-xs">USD {product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile Horizontal Scroll */}
                    <div className="block md:hidden w-full overflow-x-auto scrollbar-hide">
                      <div className="flex space-x-4 pb-4" style={{ width: "max-content" }}>
                        {consumerElectronics.slice(0, 6).map((product) => (
                          <div
                            key={product._id}
                            className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            style={{ minWidth: "140px" }}
                            onClick={() => navigate(`/products/${product._id}`)}
                          >
                            <img
                              src={product.images[0]?.url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="p-2">
                              <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">{product.name}</h3>
                              <div className="text-gray-600 text-xs">From</div>
                              <div className="text-gray-600 text-xs">USD {product.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Send Quotes to Suppliers */}
            <section className="py-8 md:py-16 bg-gradient-to-r from-blue-600 to-blue-400">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="text-white">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4">
                      An easy way to send requests to all suppliers
                    </h2>
                    <p className="text-blue-100 mb-6">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Send quote to suppliers</h3>
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <input
                        type="text"
                        placeholder="What item you need?"
                        value={inquiryForm.item}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, item: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />

                      <textarea
                        placeholder="Type more details"
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={inquiryForm.quantity}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <select
                          value={inquiryForm.unit}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, unit: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Kg">Kg</option>
                          <option value="Tons">Tons</option>
                          <option value="Boxes">Boxes</option>
                        </select>
                      </div>

                      <input
                        type="email"
                        placeholder="Your email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />

                      <button
                        type="submit"
                        disabled={submittingInquiry}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submittingInquiry ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          "Send inquiry"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>

            {/* Recommended Items */}
            <section className="py-8 md:py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Recommended items</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                  {(featuredProducts || []).slice(0, 10).map((product: any) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleProductClick(product._id)}
                    >
                      <img
                        src={product.images[0]?.url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-32 md:h-40 object-cover"
                      />
                      <div className="p-3 md:p-4">
                        <div className="text-lg font-bold text-gray-900 mb-1">${product.price}</div>
                        <h3 className="text-gray-600 text-sm line-clamp-2 hover:text-blue-600">{product.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Our Extra Services */}
            <section className="py-8 md:py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Our extra services</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {extraServices.map((service, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(service.link)}
                    >
                      <div className="relative">
                        <img
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">
                          {service.icon}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Suppliers by Region */}
            <section className="py-8 md:py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Suppliers by region</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {supplierRegions.map((region, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(region.link)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{region.flag}</span>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{region.country}</h3>
                          <p className="text-gray-600 text-xs">{region.suppliers}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Newsletter Subscription */}
            <section className="py-8 md:py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Subscribe on our newsletter</h2>
                <p className="text-gray-600 mb-8">
                  Get daily news on upcoming offers from many suppliers all over the world
                </p>

                <form onSubmit={handleNewsletterSubmit} className="md:max-w-md mx-auto flex justify-center p-0 md:p-auto">
                  <input
                    type="email"
                    placeholder="Email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribingNewsletter}
                    className="bg-blue-600 text-white px-6 py-3 rounded-r-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {subscribingNewsletter ? "..." : "Subscribe"}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomePage
