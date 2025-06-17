import express from "express"
import Category from "../models/Category.js"
import Product from "../models/Product.js"
import auth from "../middleware/auth.js"
import adminAuth from "../middleware/adminAuth.js"

const router = express.Router()

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 })

    // Update product count for each category
    for (const category of categories) {
      const productCount = await Product.countDocuments({ category: category._id })
      if (category.productCount !== productCount) {
        category.productCount = productCount
        await category.save()
      }
    }

    res.json({
      categories,
      total: categories.length,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Error fetching categories" })
  }
})

// Get single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    // Get product count
    const productCount = await Product.countDocuments({ category: category._id })
    category.productCount = productCount

    res.json(category)
  } catch (error) {
    console.error("Get category error:", error)
    res.status(500).json({ message: "Error fetching category" })
  }
})

// Create category (admin only)
router.post("/", [auth, adminAuth], async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: "Category name is required" })
    }

    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" })
    }

    const category = new Category({
      name,
      description: description || "",
    })

    await category.save()

    res.status(201).json({
      message: "Category created successfully",
      category,
    })
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ message: "Error creating category" })
  }
})

// Update category (admin only)
router.put("/:id", [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, isActive } = req.body

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true },
    )

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json({
      message: "Category updated successfully",
      category,
    })
  } catch (error) {
    console.error("Update category error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" })
    }
    res.status(500).json({ message: "Error updating category" })
  }
})

// Delete category (admin only)
router.delete("/:id", [auth, adminAuth], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id })
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${productCount} products. Please move or delete products first.`,
      })
    }

    await Category.findByIdAndDelete(req.params.id)

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ message: "Error deleting category" })
  }
})

export default router
