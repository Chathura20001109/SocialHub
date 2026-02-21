// client/assets/js/api.js
window.API_URL = window.API_URL || `${window.location.origin}/api`;

class API {
  // Get auth token from localStorage
  static getToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  static setToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove auth token from localStorage
  static removeToken() {
    localStorage.removeItem('token');
  }

  // Get current user from localStorage
  static getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set current user in localStorage
  static setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Remove current user from localStorage
  static removeCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  // Make authenticated request
  static async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${window.API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.data = data; // Attach full response data (includes errors array)
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  static async getMe() {
    return this.request('/auth/me');
  }

  static async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User endpoints
  static async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  static async getUserByUsername(username) {
    return this.request(`/users/username/${username}`);
  }

  static async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async searchUsers(query, page = 1, limit = 10) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  static async getUserPosts(userId, page = 1, limit = 10) {
    return this.request(`/users/${userId}/posts?page=${page}&limit=${limit}`);
  }

  static async getFollowers(userId, page = 1, limit = 20) {
    return this.request(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  }

  static async getFollowing(userId, page = 1, limit = 20) {
    return this.request(`/users/${userId}/following?page=${page}&limit=${limit}`);
  }

  // Post endpoints
  static async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  static async getPostById(postId) {
    return this.request(`/posts/${postId}`);
  }

  static async updatePost(postId, data) {
    return this.request(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async deletePost(postId) {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  static async getPersonalFeed(page = 1, limit = 10) {
    return this.request(`/posts/feed/personal?page=${page}&limit=${limit}`);
  }

  static async getGlobalFeed(page = 1, limit = 10) {
    return this.request(`/posts/feed/global?page=${page}&limit=${limit}`);
  }

  static async getTrendingPosts(page = 1, limit = 10) {
    return this.request(`/posts/feed/trending?page=${page}&limit=${limit}`);
  }

  // Comment endpoints
  static async addComment(commentData) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  }

  static async getPostComments(postId, page = 1, limit = 20) {
    return this.request(`/comments/post/${postId}?page=${page}&limit=${limit}`);
  }

  static async getCommentReplies(commentId, page = 1, limit = 10) {
    return this.request(`/comments/${commentId}/replies?page=${page}&limit=${limit}`);
  }

  static async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, { method: 'DELETE' });
  }

  // Like endpoints
  static async toggleLike(postId) {
    return this.request('/likes/toggle', {
      method: 'POST',
      body: JSON.stringify({ postId })
    });
  }

  static async getPostLikes(postId, page = 1, limit = 20) {
    return this.request(`/likes/post/${postId}?page=${page}&limit=${limit}`);
  }

  static async getUserLikedPosts(userId, page = 1, limit = 10) {
    return this.request(`/likes/user/${userId}?page=${page}&limit=${limit}`);
  }

  // Follow endpoints
  static async toggleFollow(userId) {
    return this.request('/follows/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  static async checkFollowStatus(userId) {
    return this.request(`/follows/check/${userId}`);
  }

  static async getMutualFollowers(userId) {
    return this.request(`/follows/mutual/${userId}`);
  }

  static async getSuggestions(limit = 10) {
    return this.request(`/follows/suggestions?limit=${limit}`);
  }

  // Notification endpoints
  static async getNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  static async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  static async markAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PUT' });
  }

  static async markAllAsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  static async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, { method: 'DELETE' });
  }
}

window.API = API;


