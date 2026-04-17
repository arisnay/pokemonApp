const status = document.getElementById("status");
const emailInput = document.getElementById("email");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const subscribeBtn = document.getElementById("subscribeBtn");
const inviteBtn = document.getElementById("inviteBtn");
const battleBtn = document.getElementById("battleBtn");

function setStatus(message) {
  status.textContent = message;
}

async function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    setStatus("Service Worker no es soportado en este navegador.");
    return null;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  return registration;
}

async function subscribeUser() {
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Ingresa tu email antes de suscribirte.");
    return;
  }

  const registration = await registerServiceWorker();
  if (!registration) return;

  const response = await fetch("/push/public-key");
  const data = await response.json();
  const publicKey = data.publicKey;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: await urlBase64ToUint8Array(publicKey)
  });

  await fetch("/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, subscription })
  });

  setStatus("Suscrito correctamente. Ahora puedes recibir notificaciones.");
}

async function sendNotification(endpoint) {
  const from = fromInput.value.trim();
  const to = toInput.value.trim();

  if (!from || !to) {
    setStatus("Completa los campos desde y a antes de enviar.");
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to })
  });

  const result = await response.json();
  setStatus(result.message || result.error || "Enviado.");
}

subscribeBtn.addEventListener("click", subscribeUser);
inviteBtn.addEventListener("click", () => sendNotification("/friends/add-friend"));
battleBtn.addEventListener("click", () => sendNotification("/friends/battle"));
