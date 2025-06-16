"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import toast from "react-hot-toast"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  sku: string
  stock: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: any, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart)
        }
      } catch (error) {
        console.error("Error parsing saved cart:", error)
        localStorage.removeItem("cart")
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage when items change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addToCart = (product: any, quantity = 1) => {
    if (!product || !product._id) {
      toast.error("Invalid product")
      return
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product._id)

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > (product.stock || 0)) {
          toast.error("Not enough stock available")
          return prevItems
        }
        toast.success("Quantity updated in cart")
        return prevItems.map((item) => (item.id === product._id ? { ...item, quantity: newQuantity } : item))
      } else {
        if (quantity > (product.stock || 0)) {
          toast.error("Not enough stock available")
          return prevItems
        }
        toast.success("Added to cart")
        return [
          ...prevItems,
          {
            id: product._id,
            name: product.name || "Unknown Product",
            price: product.price || 0,
            image:
              product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            quantity,
            sku: product.sku || "N/A",
            stock: product.stock || 0,
          },
        ]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    toast.success("Removed from cart")
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (quantity > item.stock) {
            toast.error("Not enough stock available")
            return item
          }
          return { ...item, quantity }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setItems([])
    toast.success("Cart cleared")
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
