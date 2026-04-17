require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const webpush = require("web-push");

if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI in environment configuration.");
}

if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) {
  throw new Error("Missing VAPID_PUBLIC or VAPID_PRIVATE in environment configuration.");
}

webpush.setVapidDetails(
  "mailto:tuemail@gmail.com",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

const pushRoutes = require("./routers/push");
const friendRoutes = require("./routers/friends");
const pokemonRoutes = require("./routers/pokemon");
const userRoutes = require("./routers/users");
const { router: authRoutes, auth } = require("./routers/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.log("Mongo error:", err.message));

app.use("/push", pushRoutes);
app.use("/friends", friendRoutes);
app.use("/pokemon", pokemonRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
