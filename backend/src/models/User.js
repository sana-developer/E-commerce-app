import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  avatarPublicId: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for avatar URL with optimizations
userSchema.virtual('avatarUrl').get(function() {
  if (!this.avatar) return '';
  
  // If it's a Cloudinary URL, return optimized version
  if (this.avatar.includes('cloudinary.com')) {
    return this.avatar.replace('/upload/', '/upload/w_150,h_150,c_fill,q_auto,f_auto/');
  }
  
  return this.avatar;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);