import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  collection, query, where, getDocs, limit
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
const normalizeStatus = s => String(s || "pending").toLowerCase().replace(/\s+/g, "_");

function dateValue(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
function formatDate(value) {
  const d = dateValue(value);
  return d ? d.toLocaleDateString("en-ZM", { day:"2-digit", month:"short", year:"numeric" }) : "—";
}
function daysRemaining(value) {
  const d = dateValue(value);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

async function getClient(uid) {
  const snap = await getDocs(query(collection(db, "clients"), where("customerUid", "==", uid), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function loadSubscriptions(uid) {
  const snap = await getDocs(query(collection(db, "subscriptions"), where("customerUid", "==", uid)));
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}

function renderSubscriptions(subs) {
  const list = $("subscriptionsList");
  const active = subs.filter(s => ["active","pending_expiry"].includes(normalizeStatus(s.status || s.sub_status)));
  const expiring = active.filter(s => {
    const d = daysRemaining(s.expiryDate || s.sub_expiry);
    return d !== null && d >= 0 && d <= 5;
  });
  $("subscriptionCount").textContent = subs.length;
  $("activeCount").textContent = active.length;
  $("expiringCount").textContent = expiring.length;

  if (!subs.length) {
    list.innerHTML = '<div class="loading-card">No subscriptions found yet. Your order may still be awaiting payment verification or account assignment.</div>';
    return;
  }

  list.innerHTML = subs.map(s => {
    const status = normalizeStatus(s.status || s.sub_status);
    const days = daysRemaining(s.expiryDate || s.sub_expiry);
    const expiryText = formatDate(s.expiryDate || s.sub_expiry);
    const notice = s.accountId
      ? `Account assigned${s.accountLabel ? `: ${esc(s.accountLabel)}` : ""}.`
      : "Account assignment is still pending.";
    return `<article class="subscription-card">
      <div class="subscription-title">
        <span class="service-badge">${esc(s.service || "Service")}</span>
        <h3>${esc(s.package || "Subscription")}</h3>
      </div>
      <div class="subscription-details">
        <div><span>Status</span><strong>${esc(status.replaceAll("_"," "))}</strong></div>
        <div><span>Start</span><strong>${formatDate(s.startDate || s.sub_start)}</strong></div>
        <div><span>Expiry</span><strong>${expiryText}</strong></div>
        <div><span>Time left</span><strong>${days === null ? "—" : days < 0 ? "Expired" : `${days} day${days === 1 ? "" : "s"}`}</strong></div>
      </div>
      <div class="account-notice ${s.accountId ? "" : "pending"}">${notice}</div>
      ${days !== null && days >= 0 && days <= 5 ? '<div class="expiry-warning">Your subscription is expiring soon. Contact admin to renew.</div>' : ""}
    </article>`;
  }).join("");
}

async function start(user) {
  if (!user) { window.location.href = "login.html"; return; }
  try {
    const client = await getClient(user.uid);
    if (!client) throw new Error("Your account is not linked to a customer record.");
    $("customerName").textContent = client.name || "Customer";
    $("welcomeName").textContent = client.name || "Customer";
    $("detailName").textContent = client.name || "—";
    $("detailPhone").textContent = client.phone || "—";
    $("detailEmail").textContent = client.email || user.email || "—";
    const subs = await loadSubscriptions(user.uid);
    renderSubscriptions(subs);
  } catch (err) {
    console.error(err);
    $("dashboardMessage").textContent = err.message || "Unable to load your dashboard.";
    $("dashboardMessage").className = "form-message show";
  }
}

$("logoutButton")?.addEventListener("click", async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "login.html";
});

onAuthStateChanged(auth, start);
