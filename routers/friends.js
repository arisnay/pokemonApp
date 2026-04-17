const express = require("express");
const router = express.Router();
const User = require("../models/user");
const webpush = require("web-push");

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

    const user = await User.findOne({ email: to });

    if (!user || !user.subscription) {
      return res.status(404).json({ error: "Usuario destino no encontrado o no está suscrito" });
    }

    await webpush.sendNotification(
      user.subscription,
      JSON.stringify({
        title: "⚔️ Batalla Pokémon",
        body: `${from} te ha retado a una batalla`,
        url: "/friends"
      })
    );

    res.json({ message: "Reto de batalla enviado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar notificación de batalla" });
  }
});

module.exports = router;
