// services/followService.js
const Follow = require('../models/Follow');
const User = require('../models/User');
const notificationService = require('./notificationService');

class FollowService {
  /**
   * Follow a user
   */
  async followUser(followerId, followingId) {
    // Prevent self-follow
    if (followerId.toString() === followingId.toString()) {
      throw new Error('You cannot follow yourself');
    }

    // Check if following user exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      throw new Error('User not found');
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId
    });

    if (existingFollow) {
      throw new Error('You are already following this user');
    }

    // Create follow relationship
    await Follow.create({
      follower: followerId,
      following: followingId
    });

    // Update follower and following counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followerCount: 1 } });

    // Create notification
    await notificationService.createNotification({
      recipient: followingId,
      sender: followerId,
      type: 'follow',
      message: 'started following you'
    });

    return { message: 'Successfully followed user' };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, followingId) {
    // Prevent self-unfollow
    if (followerId.toString() === followingId.toString()) {
      throw new Error('Invalid operation');
    }

    // Check if follow relationship exists
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId
    });

    if (!follow) {
      throw new Error('You are not following this user');
    }

    // Delete follow relationship
    await follow.deleteOne();

    // Update follower and following counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followerCount: -1 } });

    return { message: 'Successfully unfollowed user' };
  }

  /**
   * Toggle follow (follow if not following, unfollow if following)
   */
  async toggleFollow(followerId, followingId) {
    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId
    });

    if (existingFollow) {
      // Unfollow
      const result = await this.unfollowUser(followerId, followingId);
      return { ...result, action: 'unfollowed', isFollowing: false };
    } else {
      // Follow
      const result = await this.followUser(followerId, followingId);
      return { ...result, action: 'followed', isFollowing: true };
    }
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

  /**
   * Get mutual followers (users who both follow each other)
   */
  async getMutualFollowers(userId, otherUserId) {
    // Get users that both userId and otherUserId follow
    const userFollowing = await Follow.find({ follower: userId }).select('following');
    const otherFollowing = await Follow.find({ follower: otherUserId }).select('following');

    const userFollowingIds = new Set(userFollowing.map(f => f.following.toString()));
    const mutualIds = otherFollowing
      .map(f => f.following.toString())
      .filter(id => userFollowingIds.has(id));

    const mutualUsers = await User.find({ _id: { $in: mutualIds } })
      .select('username profileImage bio');

    return mutualUsers;
  }

  /**
   * Get follow suggestions (users not followed yet, sorted by follower count)
   */
  async getSuggestions(userId, limit = 10) {
    // Get users that current user already follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following.toString());
    followingIds.push(userId.toString()); // Exclude self

    // Find users not in following list, sorted by popularity
    const suggestions = await User.find({
      _id: { $nin: followingIds }
    })
      .select('username profileImage bio followerCount')
      .sort({ followerCount: -1 })
      .limit(limit);

    return suggestions;
  }
}

module.exports = new FollowService();

// ============================================================

