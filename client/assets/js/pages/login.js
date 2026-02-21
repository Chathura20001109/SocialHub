// client/assets/js/pages/login.js
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (Utils.isAuthenticated()) {
    window.location.href = '/pages/feed.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!Utils.validateEmail(email)) {
        Utils.showToast('Please enter a valid email', 'error');
        return;
      }

      try {
        await Auth.login(email, password);
      } catch (err) {
        console.error('Login submission error:', err);
      }
    });
  }
});
