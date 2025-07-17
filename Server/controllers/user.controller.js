const User = require('../models/user');
const mongoose = require('mongoose');

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
    const userGender = gender || 'Non-Binary';

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

module.exports.getUser = async (req, res) => {
  try {
    // 1. Validate token presence
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required - No token found',
        code: 'NO_TOKEN'
      });
    }

    // 2. Verify token with proper error handling
    let decoded;
    try {
      decoded = User.verifyToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      
      return res.status(401).json({
        message: 'Invalid or expired session',
        code: 'INVALID_TOKEN',
        action: 'reauthenticate'
      });
    }

    // 3. Validate user ID from token
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user identifier',
        code: 'INVALID_USER_ID'
      });
    }

    // 4. Fetch user with security precautions
    const user = await User.findById(decoded.id)
      .select('-password -__v -resetToken -resetExpires') // Exclude sensitive fields
      .lean();

    if (!user) {
      return res.status(404).json({
        message: 'User account not found',
        code: 'USER_NOT_FOUND',
        action: 'register'
      });
    }

    // 6. Add security headers
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('User fetch error:', error);
    
    // Handle specific database errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid user identifier format',
        code: 'INVALID_ID_FORMAT'
      });
    }

    res.status(500).json({
      message: 'Account information temporarily unavailable',
      code: 'SERVER_ERROR',
      retryAfter: 30, // Seconds
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    // 1. Verify and decode token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required', 
        code: 'NO_TOKEN' 
      });
    }

    const decoded = User.verifyToken(token);
    
    // 2. Validate user ID
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({ 
        message: 'Invalid user ID', 
        code: 'INVALID_ID' 
      });
    }

    // 3. Define allowed fields and create update object
    const allowedUpdates = {
      user: ['name', 'gender'],
      profile: ['bio', 'dateOfBirth', 'interests', 'zodiac', 'status', 'city', 'images', 'preference']
    };
    
    const updates = Object.keys(req.body).filter(key => 
      allowedUpdates.user.includes(key) || 
      allowedUpdates.profile.includes(key)
    );

    const updateObj = {};
    updates.forEach(update => {
      if (allowedUpdates.user.includes(update)) {
        // Handle root-level fields
        updateObj[update] = req.body[update];
      } else {
        // Handle profile subdocument fields
        updateObj[`profile.${update}`] = req.body[update];
      }
    });

    // 4. Construct update object with profile fields
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: updateObj },
      { 
        new: true,
        runValidators: true,
        select: '-password -__v -resetToken -resetExpires'
      }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'User not found', 
        code: 'USER_NOT_FOUND' 
      });
    }


    // 6. Format response
    const responseData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      gender: updatedUser.gender,
      profile: {
        ...updatedUser.profile,
        dateOfBirth: updatedUser.profile.dateOfBirth?.toISOString().split('T')[0]
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Update error:', error);
    
    // Handle specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Session expired', 
        code: 'SESSION_EXPIRED' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation failed', 
        code: 'VALIDATION_ERROR',
        errors 
      });
    }

    res.status(500).json({
      message: 'Update failed',
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports.allProfile = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Fetch all users except the one associated with the token
    const users = await User.find({ _id: { $ne: decoded.id } })
      .select('-password -__v -resetToken -resetExpires') // Exclude sensitive fields
      .lean();

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: 'No other profiles found',
        code: 'NO_PROFILES',
      });
    }

    // 4. Return the list of profiles
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);

    // Handle specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired',
        code: 'SESSION_EXPIRED',
      });
    }

    res.status(500).json({
      message: 'Failed to fetch profiles',
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports.rightSwipe = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    const id = req.params.id;
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Find both users
    const currentUser = await User.findById(decoded.id);
    const targetUser = await User.findById(id);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Update sendRequest array for current user
    if (!currentUser.sendRequest.includes(id)) {
      currentUser.sendRequest.push(id);
      await currentUser.save();
    }

    // 5. Update receiveRequest array for target user
    if (!targetUser.receiveRequest.includes(decoded.id)) {
      targetUser.receiveRequest.push(decoded.id);
      await targetUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'Request sent successfully'
    });


  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports.leftSwipe = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    const id = req.params.id;
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Find both users
    const currentUser = await User.findById(decoded.id);
    const targetUser = await User.findById(id);

    
    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Update blockRequest array for current user
    if (!currentUser.blockRequest.includes(id)) {
      currentUser.blockRequest.push(id);
    }

    // 5. Update blockRequest array for target user
    if (!targetUser.blockRequest.includes(decoded.id)) {
      targetUser.blockRequest.push(decoded.id);
    }

    // 6. Remove from matched array for both users
    currentUser.matched = currentUser.matched.filter(
      (uid) => uid.toString() !== id
    );
    targetUser.matched = targetUser.matched.filter(
      (uid) => uid.toString() !== decoded.id
    );

    // 7. Save changes to both users
    await currentUser.save();
    await targetUser.save();

    // 8. Send success response
    res.status(200).json({
      success: true,
      message: 'User blocked and removed from matches successfully',
    });
  }
  catch (error) {
    console.error('Error processing left swipe:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.me = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const id = req.params.id;
    // 3. Fetch the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }
    // 4. Send success response
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.sendRequests = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }
    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Fetch the user and populate the sendRequest field
    const user = await User.findById(decoded.id)
      .populate({
        path: 'sendRequest', // Populate the sendRequest field
        select: '-password -__v -resetToken -resetExpires', // Exclude sensitive fields
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Send success response with populated data
    res.status(200).json({
      success: true,
      data: user.sendRequest, // This will now contain full user data
    });
  } catch (error) {
    console.error('Error fetching send requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.receiveRequests = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }
    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Fetch the user and populate the receiveRequest field
    const user = await User.findById(decoded.id)
      .populate({
        path: 'receiveRequest', // Populate the receiveRequest field
        select: '-password -__v -resetToken -resetExpires', // Exclude sensitive fields
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Send success response with populated data
    res.status(200).json({
      success: true,
      data: user.receiveRequest, // This will now contain full user data
    });
  } catch (error) {
    console.error('Error fetching receive requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.matches = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }
    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Fetch the user and populate the matches field
    const user = await User.findById(decoded.id)
      .populate({
        path: 'matched', // Populate the matched field
        select: '-password -__v -resetToken -resetExpires', // Exclude sensitive fields
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Send success response with populated data
    res.status(200).json({
      success: true,
      data: user.matched, // This will now contain full user data
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.removeSentRequest = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    const id = req.params.id; // ID of the target user
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Find both users
    const currentUser = await User.findById(decoded.id);
    const targetUser = await User.findById(id);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Remove the request from both users
    currentUser.sendRequest = currentUser.sendRequest.filter(
      (uid) => uid.toString() !== id
    );
    targetUser.receiveRequest = targetUser.receiveRequest.filter(
      (uid) => uid.toString() !== decoded.id
    );

    await currentUser.save();
    await targetUser.save();

    // 5. Send success response
    res.status(200).json({
      success: true,
      message: 'Request removed successfully',
    });
  } catch (error) {
    console.error('Error removing request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.acceptRequest = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    const id = req.params.id; // ID of the target user
    if (!token) {
      return res.status(401).json({
      message: 'Authentication required',
      code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
      message: 'Invalid user ID',
      code: 'INVALID_ID',
      });
    }

    // 3. Find both users
    const currentUser = await User.findById(decoded.id);
    const targetUser = await User.findById(id);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      });
    }

    // 4. Remove from receiveRequest/sendRequest and add to matched for both users
    currentUser.receiveRequest = currentUser.receiveRequest.filter(
      uid => uid.toString() !== id
    );
    targetUser.sendRequest = targetUser.sendRequest.filter(
      uid => uid.toString() !== decoded.id
    );

    // Add to matched arrays if not already present
    if (!currentUser.matched.includes(id)) {
      currentUser.matched.push(id);
    }
    if (!targetUser.matched.includes(decoded.id)) {
      targetUser.matched.push(decoded.id);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
    });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.denyRequest = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    const id = req.params.id; // ID of the target user
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Find both users
    const currentUser = await User.findById(decoded.id);
    const targetUser = await User.findById(id);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Remove from receiveRequest and sendRequest
    currentUser.receiveRequest = currentUser.receiveRequest.filter(
      (uid) => uid.toString() !== id
    );
    targetUser.sendRequest = targetUser.sendRequest.filter(
      (uid) => uid.toString() !== decoded.id
    );

    await currentUser.save();
    await targetUser.save();

    // 5. Send success response
    res.status(200).json({
      success: true,
      message: 'Request denied successfully',
    });
  } catch (error) {
    console.error('Error denying request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.removeMatch = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    const id = req.params.id; // ID of the target user
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Find both users
    const currentUser = await User.findById(decoded.id);
    const targetUser = await User.findById(id);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // 4. Remove from matched arrays for both users
    currentUser.matched = currentUser.matched.filter(
      (uid) => uid.toString() !== id
    );
    targetUser.matched = targetUser.matched.filter(
      (uid) => uid.toString() !== decoded.id
    );

    await currentUser.save();
    await targetUser.save();

    // 5. Send success response
    res.status(200).json({
      success: true,
      message: 'Match removed successfully',
    });
  } catch (error) {
    console.error('Error removing match:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.subscribeUser = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);

    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }

    // 3. Find the user and update subscription status
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Accept subscription value from request body, default to true if not provided
    const { subscribtion = true } = req.body;
    user.subscribtion = subscribtion;
    await user.save();

    // 4. Send success response
    res.status(200).json({
      success: true,
      user,
      message: `Subscription ${user.subscribtion ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error subscribing user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports.premiumMatch = async (req, res) => {
  try {
    // 1. Verify and decode the token
    const token = req.cookies.token;
    const id = req.params.id; // ID of the target user
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const decoded = User.verifyToken(token);
    // 2. Validate user ID from the token
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
        code: 'INVALID_ID',
      });
    }
    // 3. Find both users
    const currentUser = await User.findById(decoded.id);
    const targetUser = await User.findById(id);
    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }
    // 4. Check if both users have already matched
    if (currentUser.matched.includes(id) && targetUser.matched.includes(decoded.id)) {
      return res.status(200).json({
        message: 'Users are already matched',
        code: 'ALREADY_MATCHED',
      });
    }
    // 5. Add to matched arrays for both users
    if (!currentUser.matched.includes(id)) {
      currentUser.matched.push(id);
    }
    if (!targetUser.matched.includes(decoded.id)) {
      targetUser.matched.push(decoded.id);
    }
    await currentUser.save();
    await targetUser.save();
    // 6. Send success response
    res.status(200).json({
      success: true,
      message: 'Premium match successful',
    });
  } catch (error) {
    console.error('Error processing premium match:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


