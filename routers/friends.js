const express = require("express");
const router = express.Router();
const User = require("../models/user");
const webpush = require("web-push");
const axios = require("axios");

router.get("/", async (req, res) => {
  const users = await User.find({}, "email");
  res.json(users);
});

router.post("/add-friend", async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: "from y to son requeridos" });
    }

    const user = await User.findOne({ email: to });

    if (!user || !user.subscription) {
      return res.status(404).json({ error: "Usuario destino no encontrado o no está suscrito" });
    }

    await webpush.sendNotification(
      user.subscription,
      JSON.stringify({
        title: "Nueva invitación de amistad",
        body: `${from} te envió una invitación`,
        url: "/friends"
      })
    );

    res.json({ message: "Solicitud de amistad enviada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar notificación de amistad" });
  }
});

router.post("/battle", async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: "from y to son requeridos" });
    }

    const userFrom = await User.findOne({ email: from });
    const userTo = await User.findOne({ email: to });

    if (!userFrom || !userTo) {
      return res.status(404).json({ error: "Uno o ambos usuarios no encontrados" });
    }

    if (!userFrom.favorites || userFrom.favorites.length === 0) {
      return res.status(400).json({ error: `${from} no tiene Pokémon favoritos` });
    }

    if (!userTo.favorites || userTo.favorites.length === 0) {
      return res.status(400).json({ error: `${to} no tiene Pokémon favoritos` });
    }

    // Elegir Pokémon aleatorio de cada usuario
    const pokemonFromId = userFrom.favorites[Math.floor(Math.random() * userFrom.favorites.length)];
    const pokemonToId = userTo.favorites[Math.floor(Math.random() * userTo.favorites.length)];

    // Obtener datos de PokeAPI
    const [pokemonFrom, pokemonTo] = await Promise.all([
      axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonFromId}`),
      axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonToId}`)
    ]);

    // Calcular poder total (suma de stats base)
    const powerFrom = pokemonFrom.data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const powerTo = pokemonTo.data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

    let winner, loser;
    if (powerFrom > powerTo) {
      winner = from;
      loser = to;
    } else if (powerTo > powerFrom) {
      winner = to;
      loser = from;
    } else {
      winner = "Empate";
      loser = null;
    }

    const battleResult = {
      pokemonFrom: {
        id: pokemonFrom.data.id,
        name: pokemonFrom.data.name,
        power: powerFrom
      },
      pokemonTo: {
        id: pokemonTo.data.id,
        name: pokemonTo.data.name,
        power: powerTo
      },
      winner,
      loser
    };

    // Enviar notificación al perdedor (o ambos si empate)
    if (userTo.subscription) {
      await webpush.sendNotification(
        userTo.subscription,
        JSON.stringify({
          title: winner === "Empate" ? "¡Batalla empatada!" : (winner === to ? "¡Ganaste la batalla!" : "Perdiste la batalla"),
          body: winner === "Empate"
            ? `${from} te desafió a una batalla - ¡Fue un empate!`
            : `${from} te desafió - ${winner === to ? '¡Ganaste!' : 'Perdiste'}`,
          url: "/friends"
        })
      );
    }

    res.json({ message: "Batalla completada", result: battleResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar batalla" });
  }
});

module.exports = router;
