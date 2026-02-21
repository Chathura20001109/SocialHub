// client/assets/js/pages/register.js
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (Utils.isAuthenticated()) {
    window.location.href = '/pages/feed.html';
    return;
  }

  const registerForm = document.getElementById('registerForm');
  const registerImageInput = document.getElementById('registerImageInput');
  const registerAvatarPreview = document.getElementById('registerAvatarPreview');
  let selectedImageData = null;

  if (registerImageInput) {
    registerImageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedImageData = await Utils.fileToBase64(file);
        registerAvatarPreview.innerHTML = `<img src="${selectedImageData}" class="avatar avatar-lg">`;
        Utils.showToast('Photo selected!', 'success');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const bio = document.getElementById('bio').value.trim();

      // Validation
      if (username.length < 3) {
        Utils.showToast('Username must be at least 3 characters', 'error');
        return;
      }

      if (!Utils.validateEmail(email)) {
        Utils.showToast('Please enter a valid email', 'error');
        return;
      }

      if (password.length < 6) {
        Utils.showToast('Password must be at least 6 characters', 'error');
        return;
      }

      try {
        Utils.showLoading();
        const userData = { username, email, password, bio };
        if (selectedImageData) {
          userData.profileImage = selectedImageData;
        }
        await Auth.register(userData);
      } catch (err) {
        console.error('Registration submission error:', err);
      } finally {
        Utils.hideLoading();
      }
    });
  }
});
