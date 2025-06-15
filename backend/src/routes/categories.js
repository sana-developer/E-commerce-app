import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(filter)
      .populate('children', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category tree (hierarchical structure)
router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.find({ parent: null, isActive: true })
      .populate({
        path: 'children',
        match: { isActive: true },
        populate: {
          path: 'children',
          match: { isActive: true }
        }
      })
      .sort({ sortOrder: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single category
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parent', 'name slug')
      .populate('children', 'name slug');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get products by category
router.get('/:slug/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      sort = 'createdAt', 
      order = 'desc',
      minPrice,
      maxPrice,
      brand
    } = req.query;

    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Build filter
    const filter = { category: category._id, isActive: true };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (brand) {
      filter.brand = new RegExp(brand, 'i');
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      category,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category (Admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, image, parent, sortOrder } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      name,
      slug,
      description,
      image,
      parent: parent || null,
      sortOrder: sortOrder || 0
    });

    await category.save();

    // If has parent, add to parent's children
    if (parent) {
      await Category.findByIdAndUpdate(
        parent,
        { $push: { children: category._id } }
      );
    }

    const populatedCategory = await Category.findById(category._id)
      .populate('parent', 'name slug')
      .populate('children', 'name slug');

    res.status(201).json(populatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category (Admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, image, parent, sortOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update slug if name changed
    let slug = category.slug;
    if (name && name !== category.name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Check if new slug already exists
      const existingCategory = await Category.findOne({ 
        slug, 
        _id: { $ne: req.params.id } 
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    // Handle parent change
    if (parent !== undefined && parent !== category.parent?.toString()) {
      // Remove from old parent
      if (category.parent) {
        await Category.findByIdAndUpdate(
          category.parent,
          { $pull: { children: category._id } }
        );
      }

      // Add to new parent
      if (parent) {
        await Category.findByIdAndUpdate(
          parent,
          { $push: { children: category._id } }
        );
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name || category.name,
        slug,
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
        parent: parent !== undefined ? parent : category.parent,
        sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
        isActive: isActive !== undefined ? isActive : category.isActive
      },
      { new: true }
    ).populate('parent', 'name slug')
     .populate('children', 'name slug');

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete category (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing products' 
      });
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories' 
      });
    }

    // Remove from parent's children array
    if (category.parent) {
      await Category.findByIdAndUpdate(
        category.parent,
        { $pull: { children: category._id } }
      );
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;