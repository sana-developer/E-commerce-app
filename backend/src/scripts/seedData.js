import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { generateInitialsAvatar } from '../utils/avatarGenerator.js';

// Load environment variables
dotenv.config();

// Import models
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Connect to MongoDB
connectDB();

const seedData = async () => {
  try {
    console.log('Starting to seed data...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'admin',
      avatar: generateInitialsAvatar('Admin User')
    });
    await adminUser.save();

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = new User({
      name: 'John Doe',
      email: 'user@ecommerce.com',
      password: userPassword,
      role: 'user',
      avatar: generateInitialsAvatar('John Doe')
    });
    await regularUser.save();

    // Create additional test users
    const testUsers = [
      { name: 'Alice Smith', email: 'alice@example.com' },
      { name: 'Bob Johnson', email: 'bob@example.com' },
      { name: 'Carol Williams', email: 'carol@example.com' },
      { name: 'David Brown', email: 'david@example.com' },
      { name: 'Emma Davis', email: 'emma@example.com' }
    ];

    for (const userData of testUsers) {
      const hashedTestPassword = await bcrypt.hash('password123', 10);
      const testUser = new User({
        name: userData.name,
        email: userData.email,
        password: hashedTestPassword,
        role: 'user',
        avatar: generateInitialsAvatar(userData.name)
      });
      await testUser.save();
    }

    console.log('Created users with avatars');

    // Create categories
    const electronicsCategory = new Category({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets'
    });
    await electronicsCategory.save();

    const clothingCategory = new Category({
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel'
    });
    await clothingCategory.save();

    const homeCategory = new Category({
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies'
    });
    await homeCategory.save();

    console.log('Created categories');

    // Create subcategories
    const smartphonesCategory = new Category({
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parent: electronicsCategory._id
    });
    await smartphonesCategory.save();

    const laptopsCategory = new Category({
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portable computers',
      parent: electronicsCategory._id
    });
    await laptopsCategory.save();

    const mensClothingCategory = new Category({
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: 'Clothing for men',
      parent: clothingCategory._id
    });
    await mensClothingCategory.save();

    // Update parent categories with children
    electronicsCategory.children = [smartphonesCategory._id, laptopsCategory._id];
    await electronicsCategory.save();

    clothingCategory.children = [mensClothingCategory._id];
    await clothingCategory.save();

    console.log('Created subcategories');

    // Create sample products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip',
        price: 999,
        originalPrice: 1099,
        discount: 9,
        category: smartphonesCategory._id,
        brand: 'Apple',
        images: [
          { url: '/placeholder.svg?height=400&width=400', alt: 'iPhone 15 Pro', isPrimary: true }
        ],
        specifications: [
          { name: 'Display', value: '6.1-inch Super Retina XDR' },
          { name: 'Chip', value: 'A17 Pro' },
          { name: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto' },
          { name: 'Storage', value: '128GB' }
        ],
        features: ['Face ID', 'Wireless Charging', '5G Compatible', 'Water Resistant'],
        stock: 50,
        sku: 'IPHONE15PRO-128',
        isFeatured: true,
        tags: ['smartphone', 'apple', 'ios', '5g']
      },
      {
        name: 'MacBook Pro 14"',
        description: 'Powerful laptop with M3 chip for professional work',
        price: 1999,
        originalPrice: 2199,
        discount: 9,
        category: laptopsCategory._id,
        brand: 'Apple',
        images: [
          { url: '/placeholder.svg?height=400&width=400', alt: 'MacBook Pro 14', isPrimary: true }
        ],
        specifications: [
          { name: 'Processor', value: 'Apple M3' },
          { name: 'Memory', value: '16GB Unified Memory' },
          { name: 'Storage', value: '512GB SSD' },
          { name: 'Display', value: '14.2-inch Liquid Retina XDR' }
        ],
        features: ['Touch ID', 'Backlit Keyboard', 'Force Touch Trackpad', 'Thunderbolt 4'],
        stock: 25,
        sku: 'MBP14-M3-512',
        isFeatured: true,
        tags: ['laptop', 'apple', 'macbook', 'professional']
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Android smartphone with AI features and excellent camera',
        price: 799,
        originalPrice: 899,
        discount: 11,
        category: smartphonesCategory._id,
        brand: 'Samsung',
        images: [
          { url: '/placeholder.svg?height=400&width=400', alt: 'Samsung Galaxy S24', isPrimary: true }
        ],
        specifications: [
          { name: 'Display', value: '6.2-inch Dynamic AMOLED 2X' },
          { name: 'Processor', value: 'Snapdragon 8 Gen 3' },
          { name: 'Camera', value: '50MP + 12MP + 10MP' },
          { name: 'Storage', value: '256GB' }
        ],
        features: ['AI Photo Editing', 'Wireless Charging', '5G', 'Water Resistant'],
        stock: 40,
        sku: 'GALAXY-S24-256',
        isFeatured: true,
        tags: ['smartphone', 'samsung', 'android', '5g', 'ai']
      },
      {
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 29.99,
        originalPrice: 39.99,
        discount: 25,
        category: mensClothingCategory._id,
        brand: 'BasicWear',
        images: [
          { url: '/placeholder.svg?height=400&width=400', alt: 'Cotton T-Shirt', isPrimary: true }
        ],
        specifications: [
          { name: 'Material', value: '100% Cotton' },
          { name: 'Fit', value: 'Regular' },
          { name: 'Care', value: 'Machine Washable' }
        ],
        features: ['Breathable', 'Soft Fabric', 'Durable', 'Pre-shrunk'],
        stock: 100,
        sku: 'TSHIRT-COTTON-M',
        tags: ['clothing', 'tshirt', 'cotton', 'casual']
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        originalPrice: 249.99,
        discount: 20,
        category: electronicsCategory._id,
        brand: 'AudioTech',
        images: [
          { url: '/placeholder.svg?height=400&width=400', alt: 'Wireless Headphones', isPrimary: true }
        ],
        specifications: [
          { name: 'Battery Life', value: '30 hours' },
          { name: 'Connectivity', value: 'Bluetooth 5.0' },
          { name: 'Noise Cancellation', value: 'Active' }
        ],
        features: ['Noise Cancellation', 'Long Battery Life', 'Comfortable Fit', 'Quick Charge'],
        stock: 75,
        sku: 'HEADPHONES-WL-NC',
        isFeatured: true,
        tags: ['headphones', 'wireless', 'audio', 'noise-cancellation']
      }
    ];

    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }

    console.log('Created sample products');
    console.log('Seed data completed successfully!');
    
    console.log('\nLogin credentials:');
    console.log('Admin: admin@ecommerce.com / admin123');
    console.log('User: user@ecommerce.com / user123');
    console.log('\nTest users:');
    testUsers.forEach(user => {
      console.log(`${user.name}: ${user.email} / password123`);
    });

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();