// client/assets/js/pages/feed.js
let currentPage = 1;
let currentFeed = 'personal';
let isLoading = false;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Utils.requireAuth()) return;

  await initializeFeed();
  setupEventListeners();
  loadNotificationCount();
});

async function initializeFeed() {
  const currentUser = API.getCurrentUser();

  // Update sidebar user info
  document.getElementById('sidebarUsername').textContent = currentUser.username;
  document.getElementById('sidebarEmail').textContent = `@${currentUser.username}`;
  document.getElementById('sidebarAvatar').src = currentUser.profileImage;
  document.getElementById('composerAvatar').src = currentUser.profileImage;

  // Set profile link
  document.getElementById('profileLink').href = `/pages/profile.html?user=${currentUser._id}`;
  document.getElementById('userProfileCard').onclick = () => {
    window.location.href = `/pages/profile.html?user=${currentUser._id}`;
  };

  // Load initial posts
  await loadPosts();

  // Load suggestions
  await loadSuggestions();

  // Handle post hash in URL (for notifications)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#post-')) {
    const postId = hash.replace('#post-', '');
    setTimeout(() => {
      const postEl = document.querySelector(`[data-post-id="${postId}"]`);
      if (postEl) {
        postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        postEl.classList.add('highlight-post');
        setTimeout(() => postEl.classList.remove('highlight-post'), 2000);
      }
    }, 500);
  }
}

function setupEventListeners() {
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
  });

  // Notifications
  document.getElementById('notificationsLink').addEventListener('click', (e) => {
    e.preventDefault();
    NotificationComponent.showModal();
  });

  // Feed tabs
  document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFeed = tab.dataset.feed;
      currentPage = 1;
      document.getElementById('postsContainer').innerHTML = '';
      await loadPosts();
    });
  });

  // Post composer
  document.getElementById('postBtn').addEventListener('click', createPost);

  // Add image button
  document.getElementById('addImageBtn').addEventListener('click', () => {
    document.getElementById('imageInput').click();
  });

  // Handle image selection
  document.getElementById('imageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      Utils.showToast(`Image selected: ${file.name}`, 'success');
      // Visual feedback: Highlight the icon
      document.getElementById('addImageBtn').style.color = 'var(--secondary)';
    }
  });

  // Load more button
  document.getElementById('loadMoreBtn').addEventListener('click', async () => {
    currentPage++;
    await loadPosts(true);
  });
}

async function loadPosts(append = false) {
  if (isLoading) return;

  isLoading = true;
  const container = document.getElementById('postsContainer');

  if (!append) {
    container.innerHTML = '<div class="text-center mt-lg"><div class="spinner"></div></div>';
  }

  try {
    let response;

    if (currentFeed === 'personal') {
      response = await API.getPersonalFeed(currentPage, 10);
    } else if (currentFeed === 'global') {
      response = await API.getGlobalFeed(currentPage, 10);
    } else if (currentFeed === 'trending') {
      response = await API.getTrendingPosts(currentPage, 10);
    }

    const posts = response.data.posts;

    if (!append) {
      container.innerHTML = '';
    } else {
      // Remove loading spinner
      const spinner = container.querySelector('.spinner')?.parentElement;
      if (spinner) spinner.remove();
    }

    if (posts.length === 0 && !append) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3 class="empty-state-title">No posts yet</h3>
          <p class="empty-state-text">
            ${currentFeed === 'personal' ? 'Follow people to see their posts here' : 'Be the first to post!'}
          </p>
        </div>
      `;
    } else {
      posts.forEach(post => {
        container.appendChild(PostComponent.create(post));
      });
    }

    // Hide load more button if no more posts
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (posts.length < 10) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }

  } catch (error) {
    container.innerHTML = `
      <div class="card text-center">
        <p class="text-muted">Failed to load posts</p>
      </div>
    `;
    Utils.handleError(error);
  } finally {
    isLoading = false;
  }
}

async function createPost() {
  const content = document.getElementById('postContent').value.trim();
  const imageUrl = document.getElementById('imageUrl').value.trim();

  if (!content) {
    Utils.showToast('Please write something', 'error');
    return;
  }

  try {
    const postData = { content };

    // Check for file upload first
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files && imageInput.files[0]) {
      Utils.showLoading();
      const base64Image = await Utils.fileToBase64(imageInput.files[0]);
      postData.image = base64Image;
    } else if (imageUrl) {
      postData.image = imageUrl;
    }

    await API.createPost(postData);

    // Clear inputs
    document.getElementById('postContent').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageUrl').classList.add('hidden');
    document.getElementById('imageInput').value = '';
    document.getElementById('addImageBtn').style.color = '';

    Utils.hideLoading();
    Utils.showToast('Post created successfully!', 'success');

    // Reload posts
    currentPage = 1;
    await loadPosts();

  } catch (error) {
    Utils.handleError(error);
  }
}

async function loadSuggestions() {
  try {
    const response = await API.getSuggestions(5);
    const users = response.data.users;
    const container = document.getElementById('suggestionsContainer');

    if (users.length === 0) {
      container.innerHTML = '<p class="text-muted text-small">No suggestions</p>';
      return;
    }

    container.innerHTML = users.map(user => `
      <div class="user-suggestion" onclick="window.location.href='profile.html?user=${user._id}'">
        <img src="${user.profileImage}" alt="${user.username}" class="avatar avatar-sm">
        <div class="suggestion-info">
          <div class="suggestion-name">${Utils.escapeHtml(user.username)}</div>
          <div class="suggestion-username">@${Utils.escapeHtml(user.username)}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); followUser('${user._id}')">
          Follow
        </button>
      </div>
    `).join('');

  } catch (error) {
    console.error('Failed to load suggestions:', error);
  }
}

async function followUser(userId) {
  try {
    await API.toggleFollow(userId);
    Utils.showToast('Followed successfully!', 'success');
    await loadSuggestions();
  } catch (error) {
    Utils.handleError(error);
  }
}

async function loadNotificationCount() {
  try {
    const response = await API.getUnreadCount();
    const count = response.data.count;

    const badge = document.getElementById('notificationBadge');
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch (error) {
    console.error('Failed to load notification count:', error);
  }
}

// Refresh notification count every 30 seconds
setInterval(loadNotificationCount, 30000);