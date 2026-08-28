// Design-stage payment page.
// Firestore payment writes will be enabled after the new Firebase project,
// Phone Auth and Firestore rules are configured.
const order = JSON.parse(sessionStorage.getItem("currentOrder") || "null");
const client = JSON.parse(sessionStorage.getItem("client") || "null");
const summary = document.getElementById("paymentSummary");
const message = document.getElementById("paymentMessage");
const form = document.getElementById("paymentForm");
const button = document.getElementById("paymentButton");
const amount = document.getElementById("amount");

function msg(text, type="error") {
  message.textContent = text;
  message.className = `form-message show ${type}`;
}

if (!order || !client) {
  summary.innerHTML = "<strong>Your signup session has expired.</strong><p>Please return to the PriceList and start again.</p>";
  form.style.display = "none";
} else {
  summary.innerHTML = `<span class="kicker">${order.ownership || "SERVICE"}</span><h2>${order.service || "Subscription"}</h2><p>${order.package || ""}</p><strong>K${Number(order.amount || 0).toFixed(2)}</strong>`;
  amount.value = Number(order.amount || 0).toFixed(2);
}

form?.addEventListener("submit", e => {
  e.preventDefault();
  if (!order || !client) return;
  const method = document.getElementById("paymentMethod").value;
  const reference = document.getElementById("transactionRef").value.trim();

  if (!method || !reference) {
    msg("Please complete the payment details.");
    return;
  }

  msg("Payment submission is ready for the Firebase workflow stage.", "success");
});
