// client/assets/js/pages/search.js
let searchTimeout;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Utils.requireAuth()) return;

  setupEventListeners();
  loadPopularUsers();

  // Set profile link
  const currentUser = API.getCurrentUser();
  document.getElementById('profileLink').href = `/pages/profile.html?user=${currentUser._id}`;
});

function setupEventListeners() {
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
  });

  // Search input with debounce
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length === 0) {
      showEmptyState();
      return;
    }

    if (query.length < 2) {
      return;
    }

    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 500);
  });
}

async function performSearch(query) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '<div class="text-center mt-lg"><div class="spinner"></div></div>';

  try {
    const response = await API.searchUsers(query, 1, 20);
    const users = response.data.users;

    if (users.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">😕</div>
          <h3 class="empty-state-title">No results found</h3>
          <p class="empty-state-text">
            Try searching for a different username or email
          </p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = users.map(user => `
      <div class="card" style="cursor: pointer;" onclick="window.location.href='/pages/profile.html?user=${user._id}'">
        <div class="flex gap-md">
          <img src="${user.profileImage}" alt="${user.username}" class="avatar avatar-lg">
          <div style="flex: 1;">
            <h3 style="font-weight: 700; margin-bottom: 0.25rem;">
              ${Utils.escapeHtml(user.username)}
            </h3>
            <p class="text-muted" style="margin-bottom: 0.5rem;">
              @${Utils.escapeHtml(user.username)}
            </p>
            <p style="font-size: 0.9375rem;">
              ${Utils.escapeHtml(user.bio || 'No bio yet')}
            </p>
            <div class="flex gap-lg mt-sm">
              <span class="text-small">
                <strong>${Utils.formatNumber(user.postCount)}</strong> Posts
              </span>
              <span class="text-small">
                <strong>${Utils.formatNumber(user.followerCount)}</strong> Followers
              </span>
              <span class="text-small">
                <strong>${Utils.formatNumber(user.followingCount)}</strong> Following
              </span>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); followUser('${user._id}')">
            Follow
          </button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    resultsContainer.innerHTML = `
      <div class="card text-center">
        <p class="text-muted">Failed to search users</p>
      </div>
    `;
    Utils.handleError(error);
  }
}

function showEmptyState() {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <h3 class="empty-state-title">Search for people</h3>
      <p class="empty-state-text">
        Find and connect with friends on SocialHub
      </p>
    </div>
  `;
}

async function followUser(userId) {
  try {
    await API.toggleFollow(userId);
    Utils.showToast('Followed successfully!', 'success');

    // Re-search to update UI
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
      await performSearch(query);
    }
  } catch (error) {
    Utils.handleError(error);
  }
}

async function loadPopularUsers() {
  try {
    const response = await API.getSuggestions(10);
    const users = response.data.users;
    const container = document.getElementById('popularUsersContainer');

    if (users.length === 0) {
      container.innerHTML = '<p class="text-muted text-small">No suggestions</p>';
      return;
    }

    container.innerHTML = users.map(user => `
      <div class="user-suggestion" onclick="window.location.href='/pages/profile.html?user=${user._id}'">
        <img src="${user.profileImage}" alt="${user.username}" class="avatar avatar-sm">
        <div class="suggestion-info">
          <div class="suggestion-name">${Utils.escapeHtml(user.username)}</div>
          <div class="suggestion-username">@${Utils.escapeHtml(user.username)}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); followUserFromSuggestion('${user._id}')">
          Follow
        </button>
      </div>
    `).join('');

  } catch (error) {
    console.error('Failed to load popular users:', error);
  }
}

async function followUserFromSuggestion(userId) {
  try {
    await API.toggleFollow(userId);
    Utils.showToast('Followed successfully!', 'success');
    await loadPopularUsers();
  } catch (error) {
    Utils.handleError(error);
  }
}