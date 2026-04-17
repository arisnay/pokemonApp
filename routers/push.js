const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC });
});

router.post("/subscribe", async (req, res) => {
  try {
    const { email, subscription } = req.body;

    if (!email || !subscription) {
      return res.status(400).json({ error: "email y subscription son requeridos" });
    }

    await User.findOneAndUpdate(
      { email },
      { email, subscription },
      { upsert: true, new: true }
    );

    res.json({ message: "Suscrito a notificaciones" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la suscripción" });
  }
});

module.exports = router;
