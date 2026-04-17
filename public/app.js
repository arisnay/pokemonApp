const status = document.getElementById("status");
const emailInput = document.getElementById("email");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const subscribeBtn = document.getElementById("subscribeBtn");
const inviteBtn = document.getElementById("inviteBtn");
const battleBtn = document.getElementById("battleBtn");
const pokemonSearch = document.getElementById("pokemonSearch");
const searchBtn = document.getElementById("searchBtn");
const pokemonResult = document.getElementById("pokemonResult");
const loadFavoritesBtn = document.getElementById("loadFavoritesBtn");
const favoritesList = document.getElementById("favoritesList");

// Elementos de autenticación
const authSection = document.getElementById("authSection");
const userSection = document.getElementById("userSection");
const userEmail = document.getElementById("userEmail");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerBtn = document.getElementById("registerBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;
let authToken = null;

function setStatus(message) {
  status.textContent = message;
}

function showAuthSection() {
  authSection.style.display = "block";
  userSection.style.display = "none";
}

function showUserSection(user) {
  authSection.style.display = "none";
  userSection.style.display = "block";
  userEmail.textContent = user.email;
  emailInput.value = user.email; // Para las otras funciones
}

function getAuthHeaders() {
  return authToken ? { "Authorization": `Bearer ${authToken}` } : {};
}

async function register() {
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();

  if (!email || !password) {
    setStatus("Completa todos los campos.");
    return;
  }

  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (response.ok) {
      setStatus("Registro exitoso. Ahora puedes iniciar sesión.");
      registerEmail.value = "";
      registerPassword.value = "";
    } else {
      setStatus(result.error || "Error en el registro.");
    }
  } catch (error) {
    setStatus("Error al registrar usuario.");
  }
}

async function login() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    setStatus("Completa todos los campos.");
    return;
  }

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (response.ok) {
      authToken = result.token;
      currentUser = result.user;
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showUserSection(currentUser);
      setStatus("Inicio de sesión exitoso.");
      loginEmail.value = "";
      loginPassword.value = "";
    } else {
      setStatus(result.error || "Error en el login.");
    }
  } catch (error) {
    setStatus("Error al iniciar sesión.");
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  showAuthSection();
  setStatus("Sesión cerrada.");
}

// Verificar si hay una sesión guardada al cargar la página
function checkSavedSession() {
  const savedToken = localStorage.getItem("authToken");
  const savedUser = localStorage.getItem("currentUser");

  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
    showUserSection(currentUser);
  } else {
    showAuthSection();
  }
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
  if (!currentUser) {
    setStatus("Debes iniciar sesión primero.");
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
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ subscription })
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
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ from, to })
  });

  const result = await response.json();
  setStatus(result.message || result.error || "Enviado.");
}

async function searchPokemon() {
  const query = pokemonSearch.value.trim();
  if (!query) {
    setStatus("Ingresa un nombre o ID de Pokémon.");
    return;
  }

  try {
    const response = await fetch(`/pokemon/${query}`);
    const pokemon = await response.json();

    if (response.ok) {
      pokemonResult.innerHTML = `
        <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
          <h3>${pokemon.name} (#${pokemon.id})</h3>
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
          <p>Altura: ${pokemon.height / 10}m | Peso: ${pokemon.weight / 10}kg</p>
          <p>Tipos: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
          <button onclick="addToFavorites(${pokemon.id}, '${pokemon.name}')">Agregar a favoritos</button>
        </div>
      `;
    } else {
      pokemonResult.innerHTML = `<p>Error: ${pokemon.error}</p>`;
    }
  } catch (error) {
    setStatus("Error al buscar Pokémon.");
  }
}

async function addToFavorites(pokemonId, name) {
  if (!currentUser) {
    setStatus("Debes iniciar sesión para agregar favoritos.");
    return;
  }

  try {
    const response = await fetch(`/users/${currentUser.email}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ pokemonId })
    });

    const result = await response.json();
    setStatus(result.message || result.error);
    if (response.ok) {
      loadFavorites(); // Recargar lista
    }
  } catch (error) {
    setStatus("Error al agregar a favoritos.");
  }
}

async function loadFavorites() {
  if (!currentUser) {
    setStatus("Debes iniciar sesión para ver tus favoritos.");
    return;
  }

  try {
    const response = await fetch(`/users/${currentUser.email}`, {
      headers: getAuthHeaders()
    });
    const user = await response.json();

    if (response.ok && user.favorites) {
      const favoritesHtml = await Promise.all(
        user.favorites.map(async (id) => {
          const pokeRes = await fetch(`/pokemon/${id}`);
          const pokemon = await pokeRes.json();
          return `
            <div style="border: 1px solid #ccc; padding: 10px; margin: 5px; display: inline-block;">
              <h4>${pokemon.name} (#${pokemon.id})</h4>
              <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" width="100" />
              <br>
              <button onclick="removeFromFavorites(${pokemon.id})">Quitar</button>
            </div>
          `;
        })
      );
      favoritesList.innerHTML = favoritesHtml.join("");
    } else {
      favoritesList.innerHTML = "<p>No tienes Pokémon favoritos.</p>";
    }
  } catch (error) {
    setStatus("Error al cargar favoritos.");
  }
}

async function removeFromFavorites(pokemonId) {
  if (!currentUser) {
    setStatus("Debes iniciar sesión.");
    return;
  }

  try {
    const response = await fetch(`/users/${currentUser.email}/favorites/${pokemonId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    const result = await response.json();
    setStatus(result.message || result.error);
    if (response.ok) {
      loadFavorites(); // Recargar lista
    }
  } catch (error) {
    setStatus("Error al quitar de favoritos.");
  }
}

// Event listeners
registerBtn.addEventListener("click", register);
loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);
subscribeBtn.addEventListener("click", subscribeUser);
inviteBtn.addEventListener("click", () => sendNotification("/friends/add-friend"));
battleBtn.addEventListener("click", () => sendNotification("/friends/battle"));
searchBtn.addEventListener("click", searchPokemon);
loadFavoritesBtn.addEventListener("click", loadFavorites);

// Inicializar
checkSavedSession();
