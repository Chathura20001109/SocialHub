// services/authService.js
const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { validateEmail, validateUsername, validatePassword } = require('../utils/validators');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { username, email, password, bio, profileImage } = userData;

    // Validate input
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!validateUsername(username)) {
      throw new Error('Username must be 3-30 characters and contain only letters, numbers, and underscores');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      bio: bio || '',
      profileImage: profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2MzY2ZjEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiPlNIPC90ZXh0Pjwvc3ZnPg=='
    });

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = user.toPublicProfile();

    return { user: userResponse, token };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = user.toPublicProfile();

    return { user: userResponse, token };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user.toPublicProfile();
  }

  /**
   * Verify token and return user
   */
  async verifyUserToken(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return user.toPublicProfile();
  }
}

module.exports = new AuthService();

// ============================================================

