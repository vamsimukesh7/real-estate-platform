import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['User', 'Agent', 'Admin'],
      default: 'User',
    },
    avatar: {
      url: String,
      publicId: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    agentDetails: {
      licenseNumber: String,
      agency: String,
      specialization: [String],
      experience: Number,
      rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
      },
      completedDeals: { type: Number, default: 0 },
    },
    permissions: [{
      type: String,
      enum: [
        'create:property',
        'read:property',
        'update:property',
        'delete:property',
        'manage:users',
        'manage:bookings',
        'manage:analytics',
        'send:messages',
        'access:admin-panel'
      ]
    }],
    savedProperties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    }],
    searchHistory: [{
      query: String,
      filters: mongoose.Schema.Types.Mixed,
      timestamp: Date,
    }],
    notifications: [{
      type: {
        type: String,
        enum: ['Message', 'Booking', 'PriceAlert', 'NewListing', 'System'],
      },
      title: String,
      message: String,
      read: { type: Boolean, default: false },
      link: String,
      createdAt: { type: Date, default: Date.now },
    }],
    preferences: {
      newsletter: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Get default permissions based on role
userSchema.methods.getDefaultPermissions = function() {
  const rolePermissions = {
    User: ['read:property', 'send:messages'],
    Agent: ['create:property', 'read:property', 'update:property', 'send:messages', 'manage:bookings'],
    Admin: [
      'create:property', 'read:property', 'update:property', 'delete:property',
      'manage:users', 'manage:bookings', 'manage:analytics', 'send:messages', 'access:admin-panel'
    ]
  };
  return rolePermissions[this.role] || rolePermissions.User;
};

// Auto-assign permissions on role change
userSchema.pre('save', function(next) {
  if (this.isModified('role') && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = this.getDefaultPermissions();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
