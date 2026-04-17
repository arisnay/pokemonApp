const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { auth } = require("./auth");

// Obtener perfil de usuario (protegido)
router.get("/:email", auth, async (req, res) => {
  try {
    const { email } = req.params;

    // Verificar que el usuario solo pueda ver su propio perfil
    if (req.user.email !== email) {
      return res.status(403).json({ error: "No tienes permiso para ver este perfil" });
    }

    const user = await User.findOne({ email }).select("-password -subscription");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// Agregar Pokémon a favoritos (protegido)
router.post("/:email/favorites", auth, async (req, res) => {
  try {
    const { email } = req.params;
    const { pokemonId } = req.body;

    // Verificar que el usuario solo pueda modificar sus propios favoritos
    if (req.user.email !== email) {
      return res.status(403).json({ error: "No tienes permiso para modificar este perfil" });
    }

    if (!pokemonId || isNaN(pokemonId)) {
      return res.status(400).json({ error: "pokemonId válido requerido" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { favorites: pokemonId } }, // addToSet evita duplicados
      { new: true, upsert: true }
    );

    res.json({ message: "Pokémon agregado a favoritos", favorites: user.favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar favorito" });
  }
});

// Quitar Pokémon de favoritos (protegido)
router.delete("/:email/favorites/:pokemonId", auth, async (req, res) => {
  try {
    const { email, pokemonId } = req.params;

    // Verificar que el usuario solo pueda modificar sus propios favoritos
    if (req.user.email !== email) {
      return res.status(403).json({ error: "No tienes permiso para modificar este perfil" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { favorites: parseInt(pokemonId) } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Pokémon removido de favoritos", favorites: user.favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al remover favorito" });
  }
});

module.exports = router;