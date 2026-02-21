// client/assets/js/pages/profile.js
let profileUserId;
let currentUser;
let isOwnProfile;
let currentTab = 'posts';
let currentPage = 1;

let isInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
  if (isInitialized) return;
  if (!Utils.requireAuth()) return;

  isInitialized = true;

  // Get user ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  profileUserId = urlParams.get('user');

  // Get current user
  currentUser = API.getCurrentUser();

  if (!profileUserId) {
    // If no user ID, show current user's profile
    profileUserId = currentUser._id;
  }

  await initializeProfile();
  setupEventListeners();
  loadNotificationCount();
});

async function initializeProfile() {
  currentUser = API.getCurrentUser();

  // Get user ID from URL if not already set
  if (!profileUserId) {
    const urlParams = new URLSearchParams(window.location.search);
    profileUserId = urlParams.get('user') || currentUser._id;
  }

  isOwnProfile = profileUserId === currentUser._id;

  try {
    // Load user profile
    const response = await API.getUserById(profileUserId);
    const user = response.data.user;
    const isFollowing = response.data.isFollowing;

    // Update profile UI
    const profileCover = document.getElementById('profileCover');
    const defaultCover = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
    const coverValue = user.coverImage || defaultCover;

    if (profileCover) {
      if (coverValue.startsWith('linear-gradient')) {
        profileCover.style.background = coverValue;
        profileCover.style.backgroundImage = coverValue;
      } else {
        profileCover.style.backgroundImage = `url(${coverValue})`;
      }
    }

    document.getElementById('profileAvatar').src = user.profileImage;
    document.getElementById('profileName').textContent = user.username;

    // Explicitly set username with @
    const usernameEl = document.getElementById('profileUsername');
    if (usernameEl) {
      const handle = user.username || 'unknown';
      usernameEl.textContent = handle.startsWith('@') ? handle : `@${handle}`;
      usernameEl.style.display = 'block';
      usernameEl.style.visibility = 'visible';
    }

    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('postsCount').textContent = Utils.formatNumber(user.postCount);
    document.getElementById('followersCount').textContent = Utils.formatNumber(user.followerCount);
    document.getElementById('followingCount').textContent = Utils.formatNumber(user.followingCount);

    // Update sidebar info (for consistency with feed)
    const sidebarUsername = document.getElementById('sidebarUsername');
    if (sidebarUsername) sidebarUsername.textContent = currentUser.username;

    const sidebarEmail = document.getElementById('sidebarEmail');
    if (sidebarEmail) sidebarEmail.textContent = `@${currentUser.username}`;

    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) sidebarAvatar.src = currentUser.profileImage;

    // Show appropriate buttons
    if (isOwnProfile) {
      document.getElementById('editProfileBtn').classList.remove('hidden');
    } else {
      const followBtn = document.getElementById('followBtn');
      followBtn.classList.remove('hidden');
      followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
      followBtn.className = isFollowing ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm';
    }

    // Set profile link in sidebar
    document.getElementById('profileLink').href = `/pages/profile.html?user=${currentUser._id}`;

    // Load posts
    await loadProfileContent();

    // Load suggestions
    await loadSuggestions();

  } catch (error) {
    Utils.handleError(error);
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

  // Edit profile
  const editBtn = document.getElementById('editProfileBtn');
  if (editBtn) {
    editBtn.onclick = showEditModal;
  }

  // Follow/Unfollow
  document.getElementById('followBtn').addEventListener('click', toggleFollow);

  // Profile tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      currentPage = 1;
      await loadProfileContent();
    });
  });

  // Stat links
  document.getElementById('followersStatLink').addEventListener('click', showFollowers);
  document.getElementById('followingStatLink').addEventListener('click', showFollowing);
}

async function loadProfileContent() {
  const container = document.getElementById('profileContent');
  container.innerHTML = '<div class="text-center mt-lg"><div class="spinner"></div></div>';

  try {
    let response;

    if (currentTab === 'posts') {
      response = await API.getUserPosts(profileUserId, currentPage, 10);
      const posts = response.data.posts;

      if (posts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <h3 class="empty-state-title">No posts yet</h3>
            <p class="empty-state-text">
              ${isOwnProfile ? "You haven't posted anything yet" : "This user hasn't posted anything yet"}
            </p>
          </div>
        `;
      } else {
        container.innerHTML = '';
        posts.forEach(post => {
          container.appendChild(PostComponent.create(post));
        });
      }
    } else if (currentTab === 'likes') {
      response = await API.getUserLikedPosts(profileUserId, currentPage, 10);
      const posts = response.data.posts;

      if (posts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">❤️</div>
            <h3 class="empty-state-title">No liked posts</h3>
            <p class="empty-state-text">
              ${isOwnProfile ? "You haven't liked any posts yet" : "This user hasn't liked any posts yet"}
            </p>
          </div>
        `;
      } else {
        container.innerHTML = '';
        posts.forEach(post => {
          container.appendChild(PostComponent.create(post));
        });
      }
    } else if (currentTab === 'followers') {
      response = await API.getFollowers(profileUserId, currentPage, 20);
      const users = response.data.followers;
      renderUserList(container, users, 'No followers yet');
    } else if (currentTab === 'following') {
      response = await API.getFollowing(profileUserId, currentPage, 20);
      const users = response.data.following;
      renderUserList(container, users, 'Not following anyone yet');
    }

  } catch (error) {
    container.innerHTML = '<div class="card text-center"><p class="text-muted">Failed to load content</p></div>';
    Utils.handleError(error);
  }
}

function renderUserList(container, users, emptyMsg) {
  if (users.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <h3 class="empty-state-title">${emptyMsg}</h3>
      </div>
    `;
  } else {
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'glass-card';
    list.style.padding = 'var(--spacing-16)';

    users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.className = 'user-suggestion';
      userDiv.style.marginBottom = 'var(--spacing-12)';
      userDiv.style.padding = 'var(--spacing-12)';
      userDiv.style.borderBottom = '1px solid var(--glass-border)';
      userDiv.style.cursor = 'pointer';

      userDiv.innerHTML = `
        <img src="${user.profileImage}" alt="${user.username}" class="avatar avatar-sm">
        <div class="suggestion-info">
          <div class="suggestion-name">${Utils.escapeHtml(user.username)}</div>
          <div class="suggestion-username">@${Utils.escapeHtml(user.username)}</div>
        </div>
      `;
      userDiv.onclick = () => window.location.href = `profile.html?user=${user._id}`;
      list.appendChild(userDiv);
    });
    container.appendChild(list);
  }
}

async function toggleFollow() {
  try {
    const response = await API.toggleFollow(profileUserId);
    const followBtn = document.getElementById('followBtn');

    if (response.data.isFollowing) {
      followBtn.textContent = 'Unfollow';
      followBtn.className = 'btn btn-secondary btn-sm';

      // Update follower count
      const count = parseInt(document.getElementById('followersCount').textContent);
      document.getElementById('followersCount').textContent = Utils.formatNumber(count + 1);
    } else {
      followBtn.textContent = 'Follow';
      followBtn.className = 'btn btn-primary btn-sm';

      // Update follower count
      const count = parseInt(document.getElementById('followersCount').textContent);
      document.getElementById('followersCount').textContent = Utils.formatNumber(Math.max(0, count - 1));
    }

    Utils.showToast(response.message, 'success');

  } catch (error) {
    Utils.handleError(error);
  }
}

function showEditModal() {
  const user = API.getCurrentUser();
  const defaultCover = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
  const currentCover = user.coverImage || defaultCover;
  const coverBackground = currentCover.startsWith('linear-gradient') ? currentCover : `url(${currentCover})`;

  const modalContent = `
    <form id="editProfileForm">
      <div class="form-group">
        <label class="form-label">Cover Photo</label>
        <div class="profile-cover-preview" id="coverPreview" style="height: 120px; border-radius: var(--radius-md); margin-bottom: var(--spacing-16); background: ${coverBackground}; background-size: cover; background-position: center; border: 1px solid var(--glass-border);"></div>
        <input type="file" id="coverImageInput" accept="image/*" class="hidden">
        <button type="button" class="btn btn-secondary btn-sm mb-md" onclick="document.getElementById('coverImageInput').click()">
          Change Cover
        </button>
      </div>

      <div class="form-group mt-md">
        <label class="form-label">Profile Image</label>
        <div class="flex items-center gap-md">
          <img src="${user.profileImage}" alt="Current Profile" id="editAvatarPreview" class="avatar avatar-lg">
          <input type="file" id="editImageInput" accept="image/*" class="hidden">
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('editImageInput').click()">
            Change Photo
          </button>
        </div>
      </div>
      
      <input type="hidden" id="editProfileImage" value="${user.profileImage || ''}">
      <input type="hidden" id="editCoverImage" value="${user.coverImage || ''}">

      <div class="form-group mt-md">
        <label class="form-label">Bio</label>
        <textarea class="form-textarea" id="editBio" maxlength="200">${user.bio || ''}</textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Save Changes</button>
    </form>
  `;

  const modal = Utils.createModal('Edit Profile', modalContent);

  // Handle cover preview
  const coverImageInput = document.getElementById('coverImageInput');
  const coverPreview = document.getElementById('coverPreview');
  const editCoverImage = document.getElementById('editCoverImage');

  coverImageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await Utils.fileToBase64(file);
      coverPreview.style.backgroundImage = `url(${base64})`;
      editCoverImage.value = base64;
    }
  });

  // Handle image preview
  const editImageInput = document.getElementById('editImageInput');
  const editAvatarPreview = document.getElementById('editAvatarPreview');
  const editProfileImage = document.getElementById('editProfileImage');

  editImageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await Utils.fileToBase64(file);
      editAvatarPreview.src = base64;
      editProfileImage.value = base64;
    }
  });

  document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateProfile(modal);
  });
}

async function updateProfile(modal) {
  try {
    Utils.showLoading();
    const profileImage = document.getElementById('editProfileImage').value.trim();
    const coverImage = document.getElementById('editCoverImage').value.trim();
    const bio = document.getElementById('editBio').value.trim();

    const response = await API.updateProfile({ profileImage, coverImage, bio });

    // Update UI
    const user = response.data.user;
    document.getElementById('profileAvatar').src = user.profileImage;
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';

    if (user.coverImage) {
      const profileCover = document.getElementById('profileCover');
      if (user.coverImage.startsWith('linear-gradient')) {
        profileCover.style.background = user.coverImage;
        profileCover.style.backgroundImage = user.coverImage;
      } else {
        profileCover.style.backgroundImage = `url(${user.coverImage})`;
      }
    }

    // Update stored user
    API.setCurrentUser(response.data.user);

    Utils.hideLoading();
    modal.remove();
    Utils.showToast('Profile updated successfully!', 'success');

  } catch (error) {
    Utils.handleError(error);
  }
}

async function showFollowers() {
  try {
    const response = await API.getFollowers(profileUserId, 1, 50);
    const followers = response.data.followers;

    const content = followers.length === 0
      ? '<p class="text-muted">No followers yet</p>'
      : followers.map(user => `
          <div class="user-suggestion" onclick="window.location.href='profile.html?user=${user._id}'">
            <img src="${user.profileImage}" alt="${user.username}" class="avatar avatar-sm">
            <div class="suggestion-info">
              <div class="suggestion-name">${Utils.escapeHtml(user.username)}</div>
              <div class="suggestion-username">@${Utils.escapeHtml(user.username)}</div>
            </div>
          </div>
        `).join('');

    Utils.createModal('Followers', content);

  } catch (error) {
    Utils.handleError(error);
  }
}

async function showFollowing() {
  try {
    const response = await API.getFollowing(profileUserId, 1, 50);
    const following = response.data.following;

    const content = following.length === 0
      ? '<p class="text-muted">Not following anyone yet</p>'
      : following.map(user => `
          <div class="user-suggestion" onclick="window.location.href='profile.html?user=${user._id}'">
            <img src="${user.profileImage}" alt="${user.username}" class="avatar avatar-sm">
            <div class="suggestion-info">
              <div class="suggestion-name">${Utils.escapeHtml(user.username)}</div>
              <div class="suggestion-username">@${Utils.escapeHtml(user.username)}</div>
            </div>
          </div>
        `).join('');

    Utils.createModal('Following', content);

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
      </div>
    `).join('');

  } catch (error) {
    console.error('Failed to load suggestions:', error);
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