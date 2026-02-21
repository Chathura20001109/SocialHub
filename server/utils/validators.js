
// utils/validators.js
/**
 * Validation helper functions
 */

const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return (
    username.length >= 3 &&
    username.length <= 30 &&
    usernameRegex.test(username)
  );
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateUrl
};

// ============================================================

