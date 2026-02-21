const authService = require('../services/authService');
const { STATUS_CODES } = require('../utils/constants');
const { createResponse, createErrorResponse } = require('../utils/helpers');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, bio, profileImage } = req.body;

    const result = await authService.register({
      username,
      email,
      password,
      bio,
      profileImage
    });

    res.status(STATUS_CODES.CREATED).json(
      createResponse(true, 'User registered successfully', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Login successful', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'User profile retrieved', { user })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token deletion)
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // In JWT, logout is handled client-side by removing the token
    // This endpoint exists for consistency and can be used for logging/analytics
    
    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Logout successful')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
const verifyToken = async (req, res, next) => {
  try {
    const user = await authService.verifyUserToken(req.user._id);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Token is valid', { user })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  verifyToken
};