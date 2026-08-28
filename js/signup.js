// Design-stage signup flow.
// No Firebase writes are made in this release.
// It prepares the same session objects that the future workflow will use.
const form = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");
const box = document.getElementById("selectedProduct");
const button = document.getElementById("continueButton");

const params = new URLSearchParams(location.search);
const fromUrl = params.get("service") ? {
  id: `url-${params.get("service").toLowerCase().replace(/\s+/g,"-")}`,
  service: params.get("service"),
  package: params.get("package") || "",
  price: Number(params.get("price") || 0),
  ownership: params.get("ownership") || "shared"
} : null;

const selected = JSON.parse(sessionStorage.getItem("selectedPrice") || "null") || fromUrl;

function msg(text, type="error") {
  message.textContent = text;
  message.className = `form-message show ${type}`;
}

if (!selected) {
  box.innerHTML = "<strong>No service selected.</strong><p>Return to the PriceList and choose a service.</p>";
  button.disabled = true;
} else {
  sessionStorage.setItem("selectedPrice", JSON.stringify(selected));
  box.innerHTML = `<span class="kicker">${selected.ownership || "SERVICE"}</span><h2>${selected.service || "Subscription"}</h2><p>${selected.package || ""}</p><strong>K${Number(selected.price || 0).toFixed(2)}</strong>`;
}

form?.addEventListener("submit", e => {
  e.preventDefault();
  if (!selected) return;
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();

  if (!name || !phone) {
    msg("Please enter your name and phone number.");
    return;
  }

  const client = { id: null, name, phone, email };
  const currentOrder = {
    id: null,
    ...selected,
    amount: Number(selected.price || 0),
    clientId: null
  };

  sessionStorage.setItem("client", JSON.stringify(client));
  sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));
  location.href = "payment.html";
});
