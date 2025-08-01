const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const ProfileSchema = new Schema({
  images: {
    type: [String], 
    default: []
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  interests: {
    type: [String],
    default: []
  },
  zodiac: {
    type: String,
    enum: [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
  },
  status: {
    type: String,
    enum: ['Friendship', 'Marriage', 'Casual', 'Long Term', 'Networking']
  },
  preference: {
    type: String,
    enum: ['Male', 'Female', 'Both']
  },
  city: {
    type: String
  }
}, { _id: false }); // Keep _id: false as in original

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
    required: function() { return !this.googleId; },
    minlength: 6
  },
  mobile: {
    type: String,
    required: function() { return !this.googleId; }, // Only required for non-Google users
    validate: {
      validator: function(v) {
        // Accepts either:
        // 1. Standard 10-digit number OR
        // 2. Google placeholder (google-<id>)
        return !v || /^\d{10}$/.test(v) || /^google-[a-z0-9-]+$/i.test(v);
      },
      message: 'Mobile must be 10 digits or Google placeholder'
    },
    default: function() {
      return this.googleId ? `google-${this._id}` : '0000000000';
    }
  },

  // Google Auth
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-Binary'],
    default: 'Non-Binary', // Google Auth
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscribtion: {
    type: Boolean,
    default: false
  },

  // Profile
  profile: {
    type: ProfileSchema,
    default: {}
  },

  // Requests
  sendRequest: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  receiveRequest: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  blockRequest: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  matched: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
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
//UserSchema.index({ mobile: 1 }, { unique: true }); // Warning: Do not uncomment this error  otherwise u will b in trouble 
UserSchema.index({ 'location': '2dsphere' }); // For geo queries
UserSchema.index({ 'profile.preferenceGender': 1, age: 1 });

UserSchema.statics.hashPassword = async function(password) {
    if (!password || typeof password !== 'string') {
        throw new Error('Password must be a valid string');
    }
    return await bcrypt.hash(password, 10);
};

//Compare password method
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