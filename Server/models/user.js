const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const ProfileSchema = new Schema({
  images: {
    type: [String], // Array of image URLs
    default: [],
    validate: [imgLimit, 'Maximum 6 images allowed']
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number] // [longitude, latitude]
  },
  interests: [String],
  preferenceGender: {
    type: [String],
    enum: ['male', 'female', 'non-binary'],
  },
  preferenceAgeRange: {
    type: {
      min: { type: Number, min: 18, max: 99 },
      max: { type: Number, min: 18, max: 99 }
    },
    default: { min: 18, max: 99 }
  }
}, { _id: false });

function imgLimit(val) {
  return val.length <= 6;
}

const UserSchema = new Schema({
  // Core Auth
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  mobile: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },

  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary'],
    required: true
  },
  
  // Profile
  profile: {
    type: ProfileSchema,
    default: {}
  },

  // System
  verification: {
    emailVerified: Boolean,
    phoneVerified: Boolean
  },
  lastActive: Date,
  accountStatus: {
    type: String,
    enum: ['active', 'paused', 'banned'],
    default: 'active'
  }
}, { timestamps: true });

// Virtual Age Field
UserSchema.virtual('age').get(function() {
  const birthYear = new Date(this.profile.dateOfBirth).getFullYear();
  return new Date().getFullYear() - birthYear;
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ mobile: 1 }, { unique: true });
UserSchema.index({ 'location': '2dsphere' }); // For geo queries
UserSchema.index({ 'profile.preferenceGender': 1, age: 1 });

UserSchema.statics.hashPassword = async function(password) {
    if (!password || typeof password !== 'string') {
        throw new Error('Password must be a valid string');
    }
    return await bcrypt.hash(password, 10);
};

// Compare password method
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

// Verify JWT token
UserSchema.statics.verifyToken = function(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
};


module.exports = mongoose.model('User', UserSchema);