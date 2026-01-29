import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    { expiresIn: '30d' }
  );
};

// @desc    Register user
// @route   POST /api/users/register (for backward compatibility) OR /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Validate role - only allow Buyer or Seller for registration
    const allowedRoles = ['Buyer', 'Seller'];
    const userRole = allowedRoles.includes(role) ? role : 'Buyer';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || user.getDefaultPermissions(),
        verified: user.verified,
        active: user.active,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login (for backward compatibility) OR /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user and include password, loginAttempts, lockUntil
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ 
        success: false, 
        message: `Account locked due to multiple failed login attempts. Try again in ${lockTime} minutes.` 
      });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account has been deactivated. Please contact support.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        await user.save();
        return res.status(403).json({ 
          success: false, 
          message: 'Account locked due to multiple failed login attempts. Try again in 30 minutes.' 
        });
      }
      
      await user.save();
      return res.status(401).json({ 
        success: false, 
        message: `Invalid email or password. ${5 - user.loginAttempts} attempts remaining.` 
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || user.getDefaultPermissions(),
        avatar: user.avatar,
        verified: user.verified,
        active: user.active,
        sellerDetails: user.sellerDetails,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio,
    };

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/users/update-password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user saved properties
// @route   GET /api/users/saved-properties
// @access  Private
export const getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedProperties',
      populate: { path: 'agent', select: 'name email phone avatar' },
    });

    const savedProperties = user.savedProperties.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        location: typeof p.location === 'string' ? p.location : (p.location?.address || 'Unknown'),
        image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: p.specifications?.bedrooms || 0,
        baths: p.specifications?.bathrooms || 0,
        sqft: p.specifications?.sqft || 0,
        type: p.propertyType,
        propertyType: p.propertyType,
        listingType: p.listingType,
        status: p.status,
        badge: p.status === 'Sold' ? 'Sold' : (p.status === 'Rented' ? 'Rented' : (p.featured ? 'Featured' : 'New')),
        tags: p.features || [],
        owner: p.owner,
        agent: p.agent,
        isSaved: true
    }));

    res.json({ success: true, data: savedProperties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Sort by date desc
    const notifications = user.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Mark only unread ones as read
    let updatedCount = 0;
    user.notifications.forEach(notif => {
        if (!notif.read) {
            notif.read = true;
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        await user.save();
    }

    res.json({ success: true, message: 'Notifications marked as read', count: updatedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Create notification (internal use)
export const createNotification = async (userId, type, title, message, link) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.notifications.push({
                notificationType: type,
                title,
                message,
                link,
                createdAt: new Date()
            });
            await user.save();
        }
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};
