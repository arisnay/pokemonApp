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
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Ingresa tu email primero.");
    return;
  }

  try {
    const response = await fetch(`/users/${email}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Ingresa tu email primero.");
    return;
  }

  try {
    const response = await fetch(`/users/${email}`);
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
  const email = emailInput.value.trim();

  try {
    const response = await fetch(`/users/${email}/favorites/${pokemonId}`, {
      method: "DELETE"
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

subscribeBtn.addEventListener("click", subscribeUser);
inviteBtn.addEventListener("click", () => sendNotification("/friends/add-friend"));
battleBtn.addEventListener("click", () => sendNotification("/friends/battle"));
searchBtn.addEventListener("click", searchPokemon);
loadFavoritesBtn.addEventListener("click", loadFavorites);
