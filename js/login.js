// Phone authentication will be connected after Firebase Phone Auth is enabled.
const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
form?.addEventListener("submit", e => {
  e.preventDefault();
  message.textContent = "Phone verification will be enabled in the workflow stage.";
  message.className = "form-message show";
});
