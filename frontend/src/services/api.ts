import axios from "axios"

const API_BASE_URL = "http://localhost:5001/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),

  register: (name: string, email: string, password: string, avatar?: File) => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("password", password)
    if (avatar) {
      formData.append("avatar", avatar)
    }
    return api.post("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}

// Products API
export const productsAPI = {
  getProducts: (params?: any) => api.get("/products", { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  searchProducts: (query: string) => api.get(`/products?search=${query}`),
}

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get("/categories"),
}

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId: string, params?: any) => api.get(`/reviews/product/${productId}`, { params }),

  createReview: (productId: string, rating: number, comment: string, images?: File[]) => {
    const formData = new FormData()
    formData.append("product", productId)
    formData.append("rating", rating.toString())
    formData.append("comment", comment)
    if (images) {
      images.forEach((image) => formData.append("images", image))
    }
    return api.post("/reviews", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}

// Orders API
export const ordersAPI = {
  createOrder: (orderData: any) => api.post("/orders", orderData),
  getUserOrders: () => api.get("/orders/user"),
}

export default api
