const User = require('../models/user');

module.exports.register = async (req, res) => {
  try {
      const { email, password, name, mobile, gender } = req.body;

      // Validate password
      if (!password || typeof password !== 'string') {
          return res.status(400).json({ message: 'Invalid password format' });
      }

      // Check if user already exists by email or googleId (if provided)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          if (existingUser.googleId) {
              return res.status(403).json({ 
                  message: 'Account already exists with Google authentication',
                  authMethod: 'google',
                  suggestion: 'Please sign in with Google or reset your password if you want to enable email/password login'
              });
          }
          return res.status(400).json({ message: 'User already exists with email/password' });
      }

      // Hash the password
      const hashedPassword = await User.hashPassword(password);

      const user = await User.create({ 
          email, 
          password: hashedPassword, 
          name, 
          mobile, 
          gender 
      });

      const token = user.generateToken();

      res.status(201).json({ 
          message: 'User registered successfully', 
          token, 
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              authMethod: 'email'
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error registering user' });
  }
};

module.exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if this is a Google-authenticated account
      if (user.googleId && !user.password) {
          return res.status(403).json({
              message: 'This account was created with Google authentication',
              authMethod: 'google',
              suggestion: 'Please sign in with Google to access your account'
          });
      }

      // For accounts that might have both Google and password auth
      if (user.googleId && user.password) {
          // Option 1: Allow password login (comment this if you want to force Google login)
          // Option 2: Force Google login (uncomment below)
          return res.status(403).json({
              message: 'This account prefers Google authentication',
              authMethod: 'google',
              suggestion: 'For better security, please sign in with Google'
          });
      }

      // Compare the hashed password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = user.generateToken();
      res.status(200).json({ 
          message: 'User logged in successfully', 
          token, 
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              authMethod: 'email'
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error logging in user' });
  }
};

// Google Authentication
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    gender: user.gender,
    isVerified: user.isVerified
  };
};


exports.googleAuth = async (req, res) => {
  try {
    const { name, email, mobile, googleId, gender } = req.body;
    
    // Validate required fields
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and Google ID are required' });
    }

    // Generate unique mobile for Google users
    const generateUniqueMobile = () => {
      const timestampPart = Date.now().toString().slice(-9);
      const randomPrefix = Math.floor(Math.random() * 9) + 1;
      const uniqueNumber = `${randomPrefix}${timestampPart}`;
      return uniqueNumber.length === 10 
        ? uniqueNumber 
        : `${randomPrefix}${'0'.repeat(10 - uniqueNumber.length)}${timestampPart}`;
    };

    const userMobile = mobile || generateUniqueMobile();
    const userGender = gender || 'non-binary';

    // Check for existing user
    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    
    if (user) {
      // Update existing user if needed
      if (!user.googleId) user.googleId = googleId;
      if (!user.gender) user.gender = userGender;
      
      // Only update mobile if it's a Google placeholder
      if (!user.mobile || user.mobile.startsWith('google-')) {
        user.mobile = generateUniqueMobile();
      }
      
      await user.save();
      
      return res.status(200).json({
        token: generateToken(user._id),
        user: formatUserResponse(user)
      });
    }
    
    // Create new user with unique mobile
    user = new User({
      name: name || 'User',
      email,
      //mobile: generateUniqueMobile(),
      googleId,
      gender: userGender,
      isVerified: true
    });
    
    await user.save();
    
    res.status(201).json({
      token: generateToken(user._id),
      user: formatUserResponse(user)
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({ 
          message: 'Email already in use',
          suggestion: 'Try signing in with your existing account'
        });
      }
      // If mobile conflict occurs (extremely rare), generate a new one and retry once
      if (error.keyPattern.mobile) {
        req.body.mobile = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        return exports.googleAuth(req, res); // Retry once
      }
    }
    
    res.status(500).json({ 
      message: 'Server error during Google authentication',
      error: error.message // Show error details in response
    });
  }
};



