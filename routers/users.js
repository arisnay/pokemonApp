const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Obtener perfil de usuario
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
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

// Agregar Pokémon a favoritos
router.post("/:email/favorites", async (req, res) => {
  try {
    const { email } = req.params;
    const { pokemonId } = req.body;

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

// Quitar Pokémon de favoritos
router.delete("/:email/favorites/:pokemonId", async (req, res) => {
  try {
    const { email, pokemonId } = req.params;

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