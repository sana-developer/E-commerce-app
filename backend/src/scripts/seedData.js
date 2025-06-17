// seedData.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import {connectDB} from '../config/db.js';

dotenv.config();
await connectDB();

const categoriesData = [
  { name: 'furniture' },
  { name: 'kitchen' },
  { name: 'electronics' },
  { name: 'gaming' },
];

const homeOutdoorProducts = [
  {
    name: "Soft chairs",
    price: 19,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop",
    category: "furniture",
  },
  {
    name: "Sofa & chair",
    price: 19,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop",
    category: "furniture",
  },
  {
    name: "Kitchen dishes",
    price: 19,
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200&h=200&fit=crop",
    category: "kitchen",
  },
  {
    name: "Smart watches",
    price: 19,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
    category: "electronics",
  },
  {
    name: "Kitchen mixer",
    price: 19,
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=200&h=200&fit=crop",
    category: "kitchen",
  },
  {
    name: "Blenders",
    price: 19,
    image: "https://images.unsplash.com/photo-1585515656643-808d6b69a52d?w=200&h=200&fit=crop",
    category: "kitchen",
  },
];

const consumerElectronics = [
  {
    name: "Smart watches",
    price: 19,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
    category: "electronics",
  },
  {
    name: "Cameras",
    price: 19,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop",
    category: "electronics",
  },
  {
    name: "Headphones",
    price: 19,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    category: "electronics",
  },
  {
    name: "Gaming set",
    price: 19,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=200&h=200&fit=crop",
    category: "gaming",
  },
  {
    name: "Laptops & PC",
    price: 19,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop",
    category: "electronics",
  },
];

// Generate dummy description and SKU
const enrichProducts = (products, categoryMap) =>
  products.map((p) => ({
    ...p,
    category: categoryMap[p.category],
    sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `${p.name} - High quality and affordable.`,
    countInStock: 50,
  }));

const importData = async () => {
  try {
    // Insert categories if not present
    const existingCategories = await Category.find({});
    const newCategoryNames = categoriesData
      .filter((cat) => !existingCategories.some((c) => c.name === cat.name));

    if (newCategoryNames.length > 0) {
      await Category.insertMany(newCategoryNames);
    }

    const allCategories = await Category.find({});
    const categoryMap = {};
    allCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    const enrichedProducts = [
      ...enrichProducts(homeOutdoorProducts, categoryMap),
      ...enrichProducts(consumerElectronics, categoryMap),
    ];

    await Product.insertMany(enrichedProducts);
    console.log('✅ New products inserted without deleting old ones.');
    process.exit();
  } catch (error) {
    console.error(`❌ Error inserting data: ${error}`);
    process.exit(1);
  }
};

importData();
