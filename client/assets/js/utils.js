// client/assets/js/utils.js
const Utils = {
  // Format date to relative time (e.g., "2 hours ago")
  formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  },

  // Format number (e.g., 1000 -> 1K)
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Show toast notification
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Show loading overlay
  showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  },

  // Hide loading overlay
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Validate email
  validateEmail(email) {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  },

  // Truncate text
  truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!API.getToken();
  },

  // Redirect to login if not authenticated
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/index.html';
      return false;
    }
    return true;
  },

  // Handle API errors
  handleError(error) {
    console.error('Error:', error);

    if (error.message.includes('token') || error.message.includes('Unauthorized')) {
      this.showToast('Session expired. Please login again.', 'error');
      API.removeToken();
      API.removeCurrentUser();
      setTimeout(() => {
        window.location.href = '/pages/index.html';
      }, 1500);
    } else {
      this.showToast(error.message || 'An error occurred', 'error');
    }
  },

  // Create modal
  createModal(title, content, onClose) {
    // Prevent multiple modals from stacking
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modalCloseBtn">
            ✕
          </button>
        </div>
        <div class="modal-body" id="modalBody">
        </div>
      </div>
    `;

    const modalBody = overlay.querySelector('#modalBody');
    if (typeof content === 'string') {
      modalBody.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      modalBody.appendChild(content);
    }

    overlay.querySelector('#modalCloseBtn').onclick = () => overlay.remove();

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        if (onClose) onClose();
      }
    });

    document.body.appendChild(overlay);
    return overlay;
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Convert file to base64 string
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
};

window.Utils = Utils;

