// Admin authentication is intentionally not connected until the new Firebase
// project and admin authorization model are configured.
const form = document.getElementById("adminLoginForm");
const message = document.getElementById("adminLoginMessage");

form?.addEventListener("submit", e => {
  e.preventDefault();
  message.textContent = "Admin authentication will be enabled in the Firebase workflow stage.";
  message.className = "form-message show";
});
