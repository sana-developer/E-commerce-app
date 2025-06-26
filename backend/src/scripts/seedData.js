// seedData.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import {connectDB} from '../config/db.js';

dotenv.config();
await connectDB();

// 1️⃣ Define categories
const newCategories = [
  'Automobiles',
  'Clothes and wear',
  'Home interiors',
  'Computer and tech',
  'Tools, equipments',
  'Sports and outdoor',
  'Animal and pets',
  'Machinery tools',
  'More category',
];

// 2️⃣ Define 6 products per category using Unsplash URLs
const productsMap = {
  Automobiles: [
    { name: 'Tesla Model S', stock: 79, image: 'https://images.unsplash.com/photo-1618279763149-d75cad3a76c1?w=200&h=200&fit=crop', sku: 'AUTO-TSL-001', description: 'Premium electric sedan with long-range battery.', countInStock: 10 },
    { name: 'Ford F-150', stock: 59, image: 'https://images.unsplash.com/photo-1597001738693-5a0dbc0dedf6?w=200&h=200&fit=crop', sku: 'AUTO-FRD-002', description: 'Rugged full-size pickup truck.', countInStock: 15 },
    { name: 'Chevrolet Camaro', stock: 42, image: 'https://images.unsplash.com/photo-1597001516770-9ccab91c984e?w=200&h=200&fit=crop', sku: 'AUTO-CAM-003', description: 'Sporty muscle car with V8 engine.', countInStock: 8 },
    { name: 'BMW X5', stock: 61, image: 'https://images.unsplash.com/photo-1583104442234-46b4b9959e8f?w=200&h=200&fit=crop', sku: 'AUTO-BMW-004', description: 'Luxurious mid-size SUV.', countInStock: 12 },
    { name: 'Mercedes C-Class', stock: 99, image: 'https://images.unsplash.com/photo-1571607384519-1ee4a9cad4aa?w=200&h=200&fit=crop', sku: 'AUTO-MER-005', description: 'Compact executive sedan.', countInStock: 9 },
    { name: 'Porsche 911', stock: 92, image: 'https://images.unsplash.com/photo-1593505696108-19384a8f1a37?w=200&h=200&fit=crop', sku: 'AUTO-POR-006', description: 'Iconic sports car for driving enthusiasts.', countInStock: 5 },
  ],
  'Clothes and wear': [
    { name: 'Classic Denim Jacket', stock: 89, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&h=200&fit=crop', sku: 'CLO-DEM-001', description: 'Timeless blue denim jacket, unisex.', countInStock: 30 },
    { name: 'Slim Fit Chino Pants', stock: 59, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=200&fit=crop', sku: 'CLO-CHN-002', description: 'Comfortable slim-fit chinos.', countInStock: 45 },
    { name: 'Basic White T-Shirt', stock: 25, image: 'https://images.unsplash.com/photo-1520975923395-3c3bf39b8f1c?w=200&h=200&fit=crop', sku: 'CLO-TEE-003', description: 'Soft cotton crew-neck tee.', countInStock: 100 },
    { name: 'Formal Oxford Shirt', stock: 69, image: 'https://images.unsplash.com/photo-1585386959984-a415522b18e1?w=200&h=200&fit=crop', sku: 'CLO-OXF-004', description: 'Crisp Oxford dress shirt.', countInStock: 40 },
    { name: 'Lightweight Hoodie', stock: 45, image: 'https://images.unsplash.com/photo-1520975913395-2c3bf39c8f1c?w=200&h=200&fit=crop', sku: 'CLO-HOD-005', description: 'Everyday breathable hoodie.', countInStock: 60 },
    { name: 'Athletic Jogger Pants', stock: 55, image: 'https://images.unsplash.com/photo-1585386959984-b415522b18e1?w=200&h=200&fit=crop', sku: 'CLO-JOG-006', description: 'Soft joggers with elastic waist.', countInStock: 50 },
  ],
  'Home interiors': [
    { name: 'Modern Floor Lamp', stock: 129, image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=200&h=200&fit=crop', sku: 'HOME-LMP-001', description: 'Sleek standing lamp with LED bulb.', countInStock: 20 },
    { name: 'Abstract Wall Art', stock: 99, image: 'https://images.unsplash.com/photo-1505691723518-36a6b9c9c011?w=200&h=200&fit=crop', sku: 'HOME-ART-002', description: 'Colorful abstract canvas art.', countInStock: 15 },
    { name: 'Plush Area Rug', stock: 149, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop', sku: 'HOME-RUG-003', description: 'Soft rug for living room comfort.', countInStock: 25 },
    { name: 'Ceramic Vase Set', stock: 59, image: 'https://images.unsplash.com/photo-1526040652367-ac003a0475fe?w=200&h=200&fit=crop', sku: 'HOME-VAS-004', description: 'Elegant decorative vase duo.', countInStock: 30 },
    { name: 'Wooden Coffee Table', stock: 299, image: 'https://images.unsplash.com/photo-1567016372610-17b0af40918b?w=200&h=200&fit=crop', sku: 'HOME-TBL-005', description: 'Sturdy mid-century coffee table.', countInStock: 12 },
    { name: 'Throw Pillow Set', stock: 49, image: 'https://images.unsplash.com/photo-1519710164237-da123dc03ef4?w=200&h=200&fit=crop', sku: 'HOME-PIL-006', description: 'Decorative and comfortable pillows.', countInStock: 40 },
  ],
  'Computer and tech': [
    { name: 'MacBook Air M2', stock: 1199, image: 'https://images.unsplash.com/photo-1646410574911-df7e3144b48a?w=200&h=200&fit=crop', sku: 'TECH-MBA-001', description: 'Ultra-portable laptop with M2 chip.', countInStock: 25 },
    { name: 'Sony WH-1000XM5', stock: 349, image: 'https://images.unsplash.com/photo-1556761175-4b46a9a5e9c8?w=200&h=200&fit=crop', sku: 'TECH-SON-002', description: 'Top-tier noise-cancelling headphones.', countInStock: 40 },
    { name: 'Logitech MX Master 3', stock: 99, image: 'https://images.unsplash.com/photo-1587829741301-dc798b82b06e?w=200&h=200&fit=crop', sku: 'TECH-LOG-003', description: 'Ergonomic wireless mouse.', countInStock: 50 },
    { name: 'Samsung 27" Monitor', stock: 279, image: 'https://images.unsplash.com/photo-1587829741301-dc798b82b06f?w=200&h=200&fit=crop', sku: 'TECH-SAM-004', description: 'High-resolution IPS display.', countInStock: 30 },
    { name: 'Anker 65W Charger', stock: 39, image: 'https://images.unsplash.com/photo-1597005612314-b3bc67184d35?w=200&h=200&fit=crop', sku: 'TECH-ANK-005', description: 'Fast USB-C power adapter.', countInStock: 60 },
    { name: 'Raspberry Pi 4 Kit', stock: 99, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200&h=200&fit=crop', sku: 'TECH-RPI-006', description: 'Starter kit for hobby projects.', countInStock: 40 },
  ],
  'Tools, equipments': [
    { name: 'DeWalt Cordless Drill', stock: 129, image: 'https://images.unsplash.com/photo-1581091012184-1a9b46a1cceb?w=200&h=200&fit=crop', sku: 'TOOL-DEV-001', description: '18V brushless drill.', countInStock: 35 },
    { name: 'Bosch Laser Measure', stock: 89, image: 'https://images.unsplash.com/photo-1597005756696-a26c27a48ff8?w=200&h=200&fit=crop', sku: 'TOOL-BOS-002', description: 'Accurate digital distance measurer.', countInStock: 40 },
    { name: 'Makita Circular Saw', stock: 199, image: 'https://images.unsplash.com/photo-1581091012185-2b9d46a1cffd?w=200&h=200&fit=crop', sku: 'TOOL-MAK-003', description: 'Powerful 7‑1/4” saw.', countInStock: 20 },
    { name: 'Stanley Tape Measure', stock: 19, image: 'https://images.unsplash.com/photo-1581091012186-3b9d46a1cffd?w=200&h=200&fit=crop', sku: 'TOOL-STA-004', description: '25ft steel tape.', countInStock: 60 },
    { name: 'Level Tool', stock: 29, image: 'https://images.unsplash.com/photo-1581091012187-4b9d46a1cffd?w=200&h=200&fit=crop', sku: 'TOOL-LEV-005', description: 'Precision bubble level.', countInStock: 50 },
    { name: 'Adjustable Wrench', stock: 24, image: 'https://images.unsplash.com/photo-1581091012188-5b9d46a1cffd?w=200&h=200&fit=crop', sku: 'TOOL-WRE-006', description: '10-inch adjustable wrench.', countInStock: 45 },
  ],
  'Sports and outdoor': [
    { name: 'Wilson Tennis Racket', stock: 129, image: 'https://images.unsplash.com/photo-1583402762400-5b4a1e36d65c?w=200&h=200&fit=crop', sku: 'SPORT-WIL-001', description: 'Lightweight graphite racket.', countInStock: 25 },
    { name: 'Adidas Soccer Ball', stock: 39, image: 'https://images.unsplash.com/photo-1583603014077-3a2c5c1d8f7b?w=200&h=200&fit=crop', sku: 'SPORT-ADI-002', description: 'Official match soccer ball.', countInStock: 50 },
    { name: 'North Face Backpack', stock: 99, image: 'https://images.unsplash.com/photo-1596464716121-a6cda92ed26a?w=200&h=200&fit=crop', sku: 'SPORT-NOR-003', description: 'Durable hiking backpack.', countInStock: 45 },
    { name: 'YETI Cooler', stock: 349, image: 'https://images.unsplash.com/photo-1583416749317-2cd5bbcb6efe?w=200&h=200&fit=crop', sku: 'SPORT-YET-004', description: 'Heavy-duty portable cooler.', countInStock: 15 },
    { name: 'Yakima Bike Rack', stock: 239, image: 'https://images.unsplash.com/photo-1583416749318-2dd5bbcb6efg?w=200&h=200&fit=crop', sku: 'SPORT-YAK-005', description: 'Roof-mounted bike carrier.', countInStock: 20 },
    { name: 'Coleman Tent 4P', stock: 179, image: 'https://images.unsplash.com/photo-1583416749319-2ed5bbcb6efh?w=200&h=200&fit=crop', sku: 'SPORT-COL-006', description: '4-person dome tent.', countInStock: 30 },
  ],
  'Animal and pets': [
    { name: 'Leather Dog Collar', stock: 25, image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200&h=200&fit=crop', sku: 'PETS-COL-001', description: 'Handcrafted leather collar.', countInStock: 40 },
    { name: 'Cat Scratching Post', stock: 49, image: 'https://images.unsplash.com/photo-1595433562696-3b083b901f36?w=200&h=200&fit=crop', sku: 'PETS-SCR-002', description: 'Sturdy sisal scratching post.', countInStock: 25 },
    { name: 'Aquarium Starter Kit', stock: 129, image: 'https://images.unsplash.com/photo-1583346754479-6a1f3b809ab5?w=200&h=200&fit=crop', sku: 'PETS-AQU-003', description: 'Complete fish tank setup.', countInStock: 15 },
    { name: 'Bird Cage Medium', stock: 79, image: 'https://images.unsplash.com/photo-1579871312172-08ffc3bf9b2c?w=200&h=200&fit=crop', sku: 'PETS-BIR-004', description: 'Medium cage for small birds.', countInStock: 20 },
    { name: 'Reptile Heat Lamp', stock: 39, image: 'https://images.unsplash.com/photo-1583346754480-1a2f3b809ab6?w=200&h=200&fit=crop', sku: 'PETS-REP-005', description: 'UV heat lamp for reptiles.', countInStock: 30 },
    { name: 'Hamster Wheel', stock: 15, image: 'https://images.unsplash.com/photo-1560807707227-8cc77767d982?w=200&h=200&fit=crop', sku: 'PETS-HAM-006', description: 'Quiet running exercise wheel.', countInStock: 50 },
  ],
  'Machinery tools': [
    { name: 'Hydraulic Jack', stock: 199, image: 'https://images.unsplash.com/photo-1581091012189-6b9d46a1cffd?w=200&h=200&fit=crop', sku: 'MACH-JAC-001', description: '2-ton hydraulic car jack.', countInStock: 15 },
    { name: 'Air Compressor', stock: 349, image: 'https://images.unsplash.com/photo-1581091012190-7c9d46a1cffd?w=200&h=200&fit=crop', sku: 'MACH-AIR-002', description: 'Portable 6‑gal compressor.', countInStock: 20 },
    { name: 'Bench Grinder', stock: 149, image: 'https://images.unsplash.com/photo-1581091012191-8d9d46a1cffd?w=200&h=200&fit=crop', sku: 'MACH-GR-003', description: '6‑inch bench grinder.', countInStock: 25 },
    { name: 'Chain Hoist', stock: 99, image: 'https://images.unsplash.com/photo-1581091012192-9e9d46a1cffd?w=200&h=200&fit=crop', sku: 'MACH-HO-004', description: '1‑ton chain hoist.', countInStock: 18 },
    { name: 'Shop Press', stock: 599, image: 'https://images.unsplash.com/photo-1581091012193-3f9d46a1cffd?w=200&h=200&fit=crop', sku: 'MACH-PRE-005', description: '20‑ton hydraulic press.', countInStock: 10 },
    { name: 'Welding Machine', stock: 299, image: 'https://images.unsplash.com/photo-1581091012194-4g9d46a1cffd?w=200&h=200&fit=crop', sku: 'MACH-WEL-006', description: 'MIG welding machine.', countInStock: 12 },
  ],
  'More category': [
    { name: 'Gift Card $50', stock: 50, image: 'https://images.unsplash.com/photo-1582719133179-ff9b7d51ccf9?w=200&h=200&fit=crop', sku: 'MORE-GFT-001', description: 'Storewide digital gift card.', countInStock: 100 },
    { name: 'Surprise Box', stock: 29, image: 'https://images.unsplash.com/photo-1582719133180-ag9b7d51ccf0?w=200&h=200&fit=crop', sku: 'MORE-SUR-002', description: 'Mystery gift box.', countInStock: 50 },
    { name: 'Portable Charger', stock: 39, image: 'https://images.unsplash.com/photo-1582719133181-ah9b7d51ccf1?w=200&h=200&fit=crop', sku: 'MORE-POW-003', description: '10000 mAh power bank.', countInStock: 75 },
    { name: 'Travel Mug', stock: 19, image: 'https://images.unsplash.com/photo-1582719133182-ai9b7d51ccf2?w=200&h=200&fit=crop', sku: 'MORE-MUG-004', description: 'Insulated steel travel mug.', countInStock: 90 },
    { name: 'Wireless Earbuds', stock: 79, image: 'https://images.unsplash.com/photo-1582719133183-aj9b7d51ccf3?w=200&h=200&fit=crop', sku: 'MORE-EAR-005', description: 'Bluetooth earbuds with case.', countInStock: 60 },
    { name: 'Desk Plant Pot', stock: 24, image: 'https://images.unsplash.com/photo-1582719133184-ak9b7d51ccf4?w=200&h=200&fit=crop', sku: 'MORE-PLT-006', description: 'Ceramic pot with succulent.', countInStock: 80 },
  ],
};

// 3️⃣ Update stock and image URLs for existing products
const updateSeedData = async () => {
  for (const category in productsMap) {
    for (const prod of productsMap[category]) {
      const existing = await Product.findOne({ sku: prod.sku });
      if (existing) {
        existing.countInStock = prod.countInStock;
        existing.image = prod.image;
        await existing.save();
        console.log(`✅ Updated: ${prod.name} (${prod.sku})`);
      } else {
        console.warn(`❌ Not found: ${prod.name} (${prod.sku})`);
      }
    }
  }
  mongoose.disconnect();
};

updateSeedData();
