import { auth, db } from "./firebase.js";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  collection, query, where, getDocs, limit
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
const message = $("loginMessage");
let confirmationResult = null;
let recaptchaVerifier = null;

function showMessage(text, type="error") {
  message.textContent = text;
  message.className = `form-message show ${type}`;
}
function normalizePhone(value) {
  let v = String(value || "").trim().replace(/[\s()-]/g, "");
  if (v.startsWith("00")) v = "+" + v.slice(2);
  if (/^0\d{9}$/.test(v)) v = "+260" + v.slice(1);
  if (/^\d{9}$/.test(v)) v = "+260" + v;
  return v;
}
async function findClientByUid(uid) {
  const snap = await getDocs(query(collection(db, "clients"), where("customerUid", "==", uid), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}
async function findClientByEmail(email) {
  const snap = await getDocs(query(collection(db, "clients"), where("email", "==", email.toLowerCase()), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}
async function finishLogin(user) {
  const client = await findClientByUid(user.uid);
  if (!client) {
    showMessage("Your Firebase account is signed in, but it is not linked to a Let's Trade ZM customer record. Please contact admin.", "error");
    await signOut(auth);
    return;
  }
  sessionStorage.setItem("client", JSON.stringify(client));
  window.location.href = "dashboard.html";
}

function setupTabs() {
  $("emailTab").addEventListener("click", () => {
    $("emailTab").classList.add("active"); $("phoneTab").classList.remove("active");
    $("emailForm").hidden = false; $("phoneForm").hidden = true;
    showMessage("");
  });
  $("phoneTab").addEventListener("click", () => {
    $("phoneTab").classList.add("active"); $("emailTab").classList.remove("active");
    $("emailForm").hidden = true; $("phoneForm").hidden = false;
    showMessage("");
    prepareRecaptcha();
  });
}

async function prepareRecaptcha() {
  if (recaptchaVerifier) return;
  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });
  await recaptchaVerifier.render();
}

$("emailForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("loginEmail").value.trim().toLowerCase();
  const button = $("emailButton");
  if (!email) return;
  button.disabled = true;
  button.textContent = "Sending...";
  try {
    const client = await findClientByEmail(email);
    if (!client) throw new Error("No customer record was found for that email. Please sign up first.");
    const actionCodeSettings = {
      url: `${location.origin}${location.pathname.replace(/[^/]+$/, "")}login.html`,
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("emailForSignIn", email);
    showMessage("Sign-in link sent. Open the email on this device and tap the link.", "success");
  } catch (err) {
    console.error(err);
    showMessage(err.message || "Unable to send the sign-in link.");
  } finally {
    button.disabled = false;
    button.textContent = "Send sign-in link";
  }
});

$("phoneForm").addEventListener("submit", async e => {
  e.preventDefault();
  const phone = normalizePhone($("loginPhone").value);
  const button = $("phoneButton");
  if (!/^\+260\d{9}$/.test(phone)) {
    showMessage("Enter a valid Zambian phone number.");
    return;
  }
  button.disabled = true; button.textContent = "Sending code...";
  try {
    await prepareRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    $("otpPanel").hidden = false;
    showMessage("Verification code sent. Enter the 6-digit code.", "success");
  } catch (err) {
    console.error(err);
    if (recaptchaVerifier) { try { recaptchaVerifier.clear(); } catch {} recaptchaVerifier = null; }
    showMessage(err.message || "Unable to send the verification code.");
  } finally {
    button.disabled = false; button.textContent = "Send verification code";
  }
});

$("verifyOtpButton").addEventListener("click", async () => {
  if (!confirmationResult) return;
  const code = $("otpCode").value.trim();
  if (!/^\d{6}$/.test(code)) { showMessage("Enter the 6-digit verification code."); return; }
  try {
    $("verifyOtpButton").disabled = true;
    const result = await confirmationResult.confirm(code);
    await finishLogin(result.user);
  } catch (err) {
    console.error(err);
    showMessage("The verification code is invalid or expired.");
  } finally {
    $("verifyOtpButton").disabled = false;
  }
});

async function handleEmailLink() {
  if (!isSignInWithEmailLink(auth, location.href)) return false;
  let email = localStorage.getItem("emailForSignIn");
  if (!email) email = window.prompt("Confirm the email address used for this sign-in link:");
  if (!email) { showMessage("Email is required to complete sign-in."); return true; }
  try {
    const result = await signInWithEmailLink(auth, email.trim().toLowerCase(), location.href);
    localStorage.removeItem("emailForSignIn");
    history.replaceState({}, document.title, location.pathname);
    await finishLogin(result.user);
  } catch (err) {
    console.error(err);
    showMessage("This sign-in link is invalid, expired, or has already been used.");
  }
  return true;
}

onAuthStateChanged(auth, async user => {
  if (user && !isSignInWithEmailLink(auth, location.href)) {
    const client = await findClientByUid(user.uid).catch(() => null);
    if (client) window.location.href = "dashboard.html";
  }
});

setupTabs();
handleEmailLink();
