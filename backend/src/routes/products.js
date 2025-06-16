import express from "express"
import Product from "../models/Product.js"
import auth from "../middleware/auth.js"
import adminAuth from "../middleware/adminAuth.js"
import { getUploadProduct, deleteFromCloudinary } from "../config/cloudinary.js"
import { generateSmartSKU } from "../utils/skuGenerator.js"

const router = express.Router()

// Get all products with filtering, sorting, and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    // Build filter object
    const filter = {}

    if (category) {
      filter.category = category
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = Number.parseFloat(maxPrice)
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }, // Also search by SKU
      ]
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Product.countDocuments(filter)

    res.json({
      products,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Error fetching products" })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Error fetching product" })
  }
})

// Create product with optional images and auto-generated SKU
router.post("/", [auth, adminAuth], (req, res) => {
  const uploadProduct = getUploadProduct()

  uploadProduct.array("images", 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      const { name, description, price, category, stock, brand, specifications, sku } = req.body

      // Validation - only require essential fields
      if (!name || !description || !price || !category) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields: name, description, price, category" })
      }

      // Generate SKU if not provided
      let finalSKU = sku
      if (!finalSKU) {
        finalSKU = await generateSmartSKU({ name, brand, category })
      } else {
        // If SKU is provided, check if it's unique
        const existingSKU = await Product.findOne({ sku: finalSKU })
        if (existingSKU) {
          return res.status(400).json({ message: "SKU already exists. Please use a different SKU." })
        }
      }

      // Process uploaded images (optional)
      const images =
        req.files && req.files.length > 0
          ? req.files.map((file) => ({
              url: file.path,
              publicId: file.filename,
              alt: name,
            }))
          : []

      // Parse specifications if provided
      let parsedSpecifications = {}
      if (specifications) {
        try {
          parsedSpecifications = typeof specifications === "string" ? JSON.parse(specifications) : specifications
        } catch (parseError) {
          return res.status(400).json({ message: "Invalid specifications format" })
        }
      }

      const product = new Product({
        name,
        description,
        price: Number.parseFloat(price),
        category,
        sku: finalSKU, // Use generated or provided SKU
        stock: Number.parseInt(stock) || 0,
        brand: brand || "",
        specifications: parsedSpecifications,
        images,
      })

      await product.save()
      await product.populate("category", "name")

      res.status(201).json({
        message: `Product created successfully with SKU: ${finalSKU}${images.length > 0 ? ` and ${images.length} image(s)` : " (no images)"}`,
        product,
      })
    } catch (error) {
      console.error("Create product error:", error)
      if (error.code === 11000 && error.keyPattern?.sku) {
        return res.status(400).json({ message: "SKU already exists. Please try again." })
      }
      res.status(500).json({ message: "Error creating product" })
    }
  })
})

// Update product
router.put("/:id", [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, price, category, stock, brand, specifications, sku } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (description) updateData.description = description
    if (price) updateData.price = Number.parseFloat(price)
    if (category) updateData.category = category
    if (stock !== undefined) updateData.stock = Number.parseInt(stock)
    if (brand) updateData.brand = brand
    if (specifications) {
      updateData.specifications = typeof specifications === "string" ? JSON.parse(specifications) : specifications
    }

    // Handle SKU update
    if (sku) {
      const existingSKU = await Product.findOne({ sku, _id: { $ne: req.params.id } })
      if (existingSKU) {
        return res.status(400).json({ message: "SKU already exists. Please use a different SKU." })
      }
      updateData.sku = sku
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate(
      "category",
      "name",
    )

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    console.error("Update product error:", error)
    if (error.code === 11000 && error.keyPattern?.sku) {
      return res.status(400).json({ message: "SKU already exists. Please use a different SKU." })
    }
    res.status(500).json({ message: "Error updating product" })
  }
})

// Add images to existing product
router.post("/:id/images", [auth, adminAuth], (req, res) => {
  const uploadProduct = getUploadProduct()

  uploadProduct.array("images", 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" })
      }

      const product = await Product.findById(req.params.id)
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
        alt: product.name,
      }))

      product.images = [...product.images, ...newImages]
      await product.save()

      res.json({
        message: "Images added successfully",
        product,
      })
    } catch (error) {
      console.error("Add images error:", error)
      res.status(500).json({ message: "Error adding images" })
    }
  })
})

// Delete product
router.delete("/:id", [auth, adminAuth], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      await deleteFromCloudinary(image.publicId);
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Error deleting product" })
  }
})

export default router
