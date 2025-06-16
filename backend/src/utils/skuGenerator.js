import Product from "../models/Product.js"

// Generate SKU based on product details
export const generateSKU = async (productName, categoryName, brand = "") => {
  try {
    // Clean and format product name (first 4 characters, uppercase)
    const namePrefix = productName
      .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
      .substring(0, 4)
      .toUpperCase()
      .padEnd(4, "X") // Pad with X if less than 4 chars

    // Clean and format category (first 3 characters, uppercase)
    const categoryPrefix = categoryName
      ? categoryName
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 3)
          .toUpperCase()
          .padEnd(3, "X")
      : "GEN" // Generic if no category

    // Clean and format brand (first 2 characters, uppercase)
    const brandPrefix = brand
      ? brand
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 2)
          .toUpperCase()
          .padEnd(2, "X")
      : "XX"

    // Generate random 3-digit number
    const randomNum = Math.floor(Math.random() * 900) + 100

    // Combine: NAME-CAT-BRAND-NUM (e.g., IPHO-ELE-AP-123)
    const baseSKU = `${namePrefix}-${categoryPrefix}-${brandPrefix}-${randomNum}`

    // Ensure uniqueness
    let finalSKU = baseSKU
    let counter = 1

    while (await Product.findOne({ sku: finalSKU })) {
      finalSKU = `${baseSKU}-${counter}`
      counter++
    }

    return finalSKU
  } catch (error) {
    console.error("Error generating SKU:", error)
    // Fallback to timestamp-based SKU
    return `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
}

// Alternative: Simple sequential SKU generator
export const generateSequentialSKU = async () => {
  try {
    const lastProduct = await Product.findOne().sort({ createdAt: -1 }).select("sku")

    if (!lastProduct) {
      return "SKU-000001"
    }

    // Extract number from last SKU (assuming format SKU-XXXXXX)
    const lastNumber = lastProduct.sku.match(/\d+$/)
    const nextNumber = lastNumber ? Number.parseInt(lastNumber[0]) + 1 : 1

    return `SKU-${nextNumber.toString().padStart(6, "0")}`
  } catch (error) {
    console.error("Error generating sequential SKU:", error)
    return `SKU-${Date.now()}`
  }
}

// Generate SKU based on product attributes (recommended)
export const generateSmartSKU = async (productData) => {
  const { name, brand, category } = productData

  try {
    // Get category name if it's an ObjectId
    let categoryName = ""
    if (category) {
      const Category = (await import("../models/Category.js")).default
      const categoryDoc = await Category.findById(category).select("name")
      categoryName = categoryDoc ? categoryDoc.name : ""
    }

    return await generateSKU(name, categoryName, brand)
  } catch (error) {
    console.error("Error generating smart SKU:", error)
    return await generateSequentialSKU()
  }
}
