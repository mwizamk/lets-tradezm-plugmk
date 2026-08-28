const message = document.getElementById("dashboardMessage");
const logout = document.getElementById("logoutButton");

logout?.addEventListener("click", () => {
  sessionStorage.clear();
  location.href = "index.html";
});

message.textContent = "Dashboard is ready for Firebase customer data.";
message.className = "form-message show";
