// services/userService.js
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { validateUrl } = require('../utils/validators');

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const { bio, profileImage, coverImage } = updateData;

    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (profileImage !== undefined) update.profileImage = profileImage;
    if (coverImage !== undefined) update.coverImage = coverImage;

    const user = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Search users by username or email
   */
  async searchUsers(query, currentUserId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Create search regex (case-insensitive)
    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      $or: [
        { username: searchRegex },
        { email: searchRegex }
      ]
    })
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ username: 1 });

    const total = await User.countDocuments({
      _id: { $ne: currentUserId },
      $or: [
        { username: searchRegex },
        { email: searchRegex }
      ]
    });

    return { users, total };
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Post.countDocuments({ author: userId });

    return { posts, total };
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'username profileImage bio followerCount followingCount')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Follow.countDocuments({ following: userId });

    // Extract follower user objects
    const followerUsers = followers.map(f => f.follower);

    return { followers: followerUsers, total };
  }

  /**
   * Get users that the user is following
   */
  async getFollowing(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'username profileImage bio followerCount followingCount')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Follow.countDocuments({ follower: userId });

    // Extract following user objects
    const followingUsers = following.map(f => f.following);

    return { following: followingUsers, total };
  }

  /**
   * Check if user A follows user B
   */
  async checkFollowStatus(followerId, followingId) {
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId
    });

    return !!follow;
  }
}

module.exports = new UserService();

// ============================================================

