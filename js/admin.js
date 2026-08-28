// Admin dashboard shell.
// Firestore reads/writes will be enabled only after the new project and rules
// have been configured and verified.
const message = document.getElementById("adminMessage");
const logout = document.getElementById("adminLogout");

logout?.addEventListener("click", () => location.href = "admin-login.html");
message.textContent = "Firebase connection not configured yet.";
