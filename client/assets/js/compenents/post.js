// client/assets/js/components/post.js
const PostComponent = {
  create(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    postCard.dataset.postId = post._id;

    const currentUser = API.getCurrentUser();
    const isOwnPost = currentUser && post.author._id === currentUser._id;

    postCard.innerHTML = `
      <img src="${post.author.profileImage}" alt="${post.author.username}" class="avatar" 
           onclick="window.location.href='profile.html?user=${post.author._id}'">
      <div class="post-content">
        <div class="post-header">
          <span class="post-author" onclick="window.location.href='profile.html?user=${post.author._id}'">
            ${Utils.escapeHtml(post.author.username)}
          </span>
          <span class="post-username">@${Utils.escapeHtml(post.author.username)}</span>
          <span class="post-time">${Utils.formatTimeAgo(post.createdAt)}</span>
          ${isOwnPost ? `
            <button class="btn btn-sm btn-danger" style="margin-left: auto;" onclick="PostComponent.deletePost('${post._id}')">
              Delete
            </button>
          ` : ''}
        </div>
        
        <div class="post-text">${Utils.escapeHtml(post.content)}</div>
        
        ${post.image ? `
          <img src="${post.image}" alt="Post image" class="post-image">
        ` : ''}
        
        <div class="post-actions">
          <button class="post-action" onclick="PostComponent.toggleComments('${post._id}')">
            <span>💬</span>
            <span>${Utils.formatNumber(post.commentCount)}</span>
          </button>
          
          <button class="post-action ${post.isLiked ? 'liked' : ''}" onclick="PostComponent.toggleLike('${post._id}')">
            <span>${post.isLiked ? '❤️' : '🤍'}</span>
            <span class="like-count">${Utils.formatNumber(post.likeCount)}</span>
          </button>
        </div>
        
        <div class="comments-section hidden" id="comments-${post._id}">
          <div class="mt-md">
            <textarea class="form-input" placeholder="Write a comment..." id="comment-input-${post._id}"></textarea>
            <button class="btn btn-primary btn-sm mt-sm" onclick="PostComponent.addComment('${post._id}')">
              Comment
            </button>
          </div>
          <div class="comments-list mt-md" id="comments-list-${post._id}"></div>
        </div>
      </div>
    `;

    return postCard;
  },

  async toggleLike(postId) {
    try {
      const response = await API.toggleLike(postId);
      const postCard = document.querySelector(`[data-post-id="${postId}"]`);
      const likeBtn = postCard.querySelector('.post-action.liked, .post-action:has(span:first-child:contains("🤍"))');
      const likeCount = likeBtn.querySelector('.like-count');

      if (response.data.isLiked) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('span:first-child').textContent = '❤️';
        likeCount.textContent = Utils.formatNumber(parseInt(likeCount.textContent.replace(/[KM]/g, '')) + 1);
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('span:first-child').textContent = '🤍';
        likeCount.textContent = Utils.formatNumber(Math.max(0, parseInt(likeCount.textContent.replace(/[KM]/g, '')) - 1));
      }

    } catch (error) {
      Utils.handleError(error);
    }
  },

  async toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const commentsList = document.getElementById(`comments-list-${postId}`);

    if (commentsSection.classList.contains('hidden')) {
      commentsSection.classList.remove('hidden');
      
      // Load comments if not already loaded
      if (commentsList.children.length === 0) {
        await this.loadComments(postId);
      }
    } else {
      commentsSection.classList.add('hidden');
    }
  },

  async loadComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    commentsList.innerHTML = '<div class="spinner"></div>';

    try {
      const response = await API.getPostComments(postId, 1, 20);
      const comments = response.data.comments;

      if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-muted text-small">No comments yet</p>';
        return;
      }

      commentsList.innerHTML = comments.map(comment => `
        <div class="card mt-sm" style="padding: var(--spacing-md);">
          <div class="flex gap-sm">
            <img src="${comment.author.profileImage}" alt="${comment.author.username}" class="avatar avatar-sm">
            <div style="flex: 1;">
              <div class="flex-between">
                <span style="font-weight: 600; font-size: 0.875rem;">
                  ${Utils.escapeHtml(comment.author.username)}
                </span>
                <span class="text-muted text-small">
                  ${Utils.formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              <p style="margin-top: 0.25rem; font-size: 0.875rem;">
                ${Utils.escapeHtml(comment.content)}
              </p>
            </div>
          </div>
        </div>
      `).join('');

    } catch (error) {
      commentsList.innerHTML = '<p class="text-muted text-small">Failed to load comments</p>';
      console.error('Failed to load comments:', error);
    }
  },

  async addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();

    if (!content) {
      Utils.showToast('Please write a comment', 'error');
      return;
    }

    try {
      await API.addComment({ postId, content });
      input.value = '';
      
      // Reload comments
      await this.loadComments(postId);
      
      // Update comment count
      const postCard = document.querySelector(`[data-post-id="${postId}"]`);
      const commentCount = postCard.querySelector('.post-action span:last-child');
      commentCount.textContent = Utils.formatNumber(parseInt(commentCount.textContent) + 1);

      Utils.showToast('Comment added!', 'success');

    } catch (error) {
      Utils.handleError(error);
    }
  },

  async deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await API.deletePost(postId);
      
      // Remove post from DOM
      const postCard = document.querySelector(`[data-post-id="${postId}"]`);
      postCard.remove();

      Utils.showToast('Post deleted successfully', 'success');

    } catch (error) {
      Utils.handleError(error);
    }
  }
};

// ============================================================

