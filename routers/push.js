const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { auth } = require("./auth");

router.get("/public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC });
});

router.post("/subscribe", auth, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: "subscription es requerida" });
    }

    // Usar el email del usuario autenticado
    await User.findOneAndUpdate(
      { email: req.user.email },
      { subscription },
      { new: true }
    );

    res.json({ message: "Suscrito a notificaciones" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la suscripción" });
  }
});

module.exports = router;
