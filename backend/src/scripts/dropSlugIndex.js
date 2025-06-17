import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';

dotenv.config();
connectDB();

const dropSlugIndex = async () => {
  try {
    const result = await mongoose.connection.collection('categories').dropIndex('slug_1');
    console.log('✅ Dropped slug_1 index:', result);
  } catch (err) {
    console.error('⚠️ Error dropping slug_1 index:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

dropSlugIndex();
