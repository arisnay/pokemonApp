const express = require("express");
const axios = require("axios");
const router = express.Router();

// Buscar Pokémon por nombre o ID
router.get("/", async (req, res) => {
  try {
    const { name, limit = 20, offset = 0 } = req.query;

    let url;
    if (name) {
      url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;
    } else {
      url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener Pokémon" });
  }
});

// Obtener detalles de un Pokémon específico
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Pokémon no encontrado" });
  }
});

module.exports = router;