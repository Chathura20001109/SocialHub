const Auth = {
  // Helper to handle fetch responses
  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  // Register User
  async register(userData) {
    try {
      const result = await API.register(userData);

      // Assuming your backend returns a token: { token: "xyz", user: {...} }
      if (result.data && result.data.token) {
        API.setToken(result.data.token);
        API.setCurrentUser(result.data.user);
        Utils.showToast('Registration successful!', 'success');
        setTimeout(() => {
          window.location.href = '/pages/feed.html';
        }, 1000);
      } else {
        Utils.showToast('Registration failed, no token received', 'error');
      }
    } catch (error) {
      console.error('Register Error:', error);
      const message = error.data && error.data.errors && error.data.errors[0]
        ? error.data.errors[0].message
        : (error.message || 'Registration failed');
      Utils.showToast(message, 'error');
    }
  },

  // Login User
  async login(email, password) {
    try {
      const result = await API.login({ email, password });

      // Save token
      if (result.data && result.data.token) {
        API.setToken(result.data.token);
        API.setCurrentUser(result.data.user);
        Utils.showToast('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = '/pages/feed.html';
        }, 1000);
      }
    } catch (error) {
      console.error('Login Error:', error);
      const message = error.data && error.data.errors && error.data.errors[0]
        ? error.data.errors[0].message
        : (error.message || 'Login failed');
      Utils.showToast(message, 'error');
    }
  },

  // Logout
  logout() {
    API.removeToken();
    API.removeCurrentUser();
    window.location.href = '/pages/index.html';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

window.Auth = Auth;