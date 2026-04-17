# Pokémon Push Backend

Servidor Express + MongoDB + Web Push para notificaciones de invitación y batalla.

## Archivos principales
- `server.js`: configura Express, MongoDB y rutas de push.
- `routers/push.js`: obtiene la clave pública VAPID y guarda suscripciones.
- `routers/friends.js`: envía notificaciones cuando llega una invitación o reto.
- `public/`: cliente de ejemplo con Service Worker.

## Pasos para ejecutar localmente
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear `.env` con:
   ```env
   MONGO_URI=tu_uri_de_mongo_atlas
   PORT=3000
   VAPID_PUBLIC=tu_clave_publica
   VAPID_PRIVATE=tu_clave_privada
   ```
3. Iniciar el servidor:
   ```bash
   npm run dev
   ```
4. Abrir `http://localhost:3000` en el navegador.

## Rutas disponibles
- `GET /push/public-key`
- `POST /push/subscribe`
- `POST /friends/add-friend`
- `POST /friends/battle`

## Despliegue online
1. Usa Railway, Render o Vercel para desplegar el backend.
2. En el panel de la plataforma, configura las variables de entorno.
3. Asegúrate de usar `npm start` como comando de inicio.
4. Si usas MongoDB Atlas, no dejes la contraseña en el repositorio.
