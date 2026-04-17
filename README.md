# Pokémon Backend con Push Notifications

Backend completo para una aplicación de Pokémon con autenticación JWT, push notifications, PokeAPI integration y sistema de batallas.

## Características

- ✅ **Autenticación JWT**: Registro y login de usuarios
- ✅ **Push Notifications**: Notificaciones push usando Web Push API
- ✅ **PokeAPI Integration**: Búsqueda y detalles de Pokémon
- ✅ **Sistema de Favoritos**: Guardar Pokémon favoritos por usuario
- ✅ **Batallas Automáticas**: Sistema de batallas entre usuarios usando stats de Pokémon
- ✅ **MongoDB**: Base de datos NoSQL para persistencia de datos

## Tecnologías

- **Backend**: Node.js + Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Push Notifications**: Web Push API con VAPID
- **API Externa**: PokeAPI para datos de Pokémon
- **Frontend**: HTML/CSS/JavaScript vanilla

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno en `.env`:
   ```
   MONGO_URI=tu_uri_de_mongodb
   PORT=3000
   VAPID_PUBLIC=tu_clave_publica_vapid
   VAPID_PRIVATE=tu_clave_privada_vapid
   JWT_SECRET=tu_clave_secreta_para_jwt
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

## Endpoints de API

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `GET /users/:email` - Obtener perfil de usuario (requiere auth)
- `POST /users/:email/favorites` - Agregar Pokémon a favoritos (requiere auth)
- `DELETE /users/:email/favorites/:pokemonId` - Quitar Pokémon de favoritos (requiere auth)

### Push Notifications
- `GET /push/public-key` - Obtener clave pública VAPID
- `POST /push/subscribe` - Suscribir usuario a notificaciones (requiere auth)

### Amigos y Batallas
- `GET /friends` - Lista de usuarios (requiere auth)
- `POST /friends/add-friend` - Enviar invitación de amistad (requiere auth)
- `POST /friends/battle` - Iniciar batalla entre usuarios (requiere auth)

### Pokémon
- `GET /pokemon` - Lista de Pokémon (paginada)
- `GET /pokemon/:id` - Detalles de un Pokémon específico

## Uso del Frontend

1. Abre `http://localhost:3000` en tu navegador
2. Regístrate con un email y contraseña
3. Inicia sesión
4. Suscríbete a notificaciones push
5. Busca Pokémon y agrégalos a favoritos
6. Envía invitaciones de amistad o retos de batalla

## Despliegue Online

### Opción 1: Render (Recomendado)

1. **Crear cuenta en Render**: Ve a [render.com](https://render.com) y regístrate
2. **Conectar GitHub**: En el dashboard, haz click en "New +" → "Web Service"
3. **Seleccionar repositorio**: Elige `arisnay/pokemonApp` de tu GitHub
4. **Configurar servicio**:
   - **Name**: `pokemon-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Variables de entorno**: Agrega estas variables en "Environment":
   ```
   MONGO_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/pokemonapp
   VAPID_PUBLIC=tu_clave_publica_vapid
   VAPID_PRIVATE=tu_clave_privada_vapid
   JWT_SECRET=tu_clave_secreta_muy_segura
   NODE_ENV=production
   ```
6. **Desplegar**: Haz click en "Create Web Service"

### Configuración de MongoDB Atlas

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea un cluster gratuito
3. Configura usuario y contraseña
4. En "Network Access", permite acceso desde cualquier IP (0.0.0.0/0)
5. Copia la connection string y reemplaza `<password>` con tu contraseña

### Generar claves VAPID

Para notificaciones push, genera nuevas claves VAPID:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Usa las claves generadas en las variables de entorno.

### URL de producción

Una vez desplegado, tu API estará disponible en: `https://tu-proyecto.onrender.com`

**Importante**: Actualiza el frontend para usar esta URL en producción.

## Estructura del Proyecto

```
├── server.js              # Punto de entrada del servidor
├── models/
│   ├── user.js           # Modelo de usuario
│   └── notification.js   # Modelo de notificación
├── routers/
│   ├── auth.js           # Rutas de autenticación
│   ├── users.js          # Rutas de usuarios
│   ├── push.js           # Rutas de push notifications
│   ├── friends.js        # Rutas de amigos y batallas
│   └── pokemon.js        # Rutas de PokeAPI
├── public/
│   ├── index.html        # Frontend principal
│   ├── app.js           # JavaScript del frontend
│   └── sw.js            # Service Worker para notificaciones
├── package.json
├── .env                  # Variables de entorno
└── README.md
```

## Notas de Desarrollo

- Todas las rutas protegidas requieren autenticación JWT
- Las notificaciones push solo funcionan en HTTPS en producción
- El sistema de batallas usa stats base de PokeAPI para determinar ganadores
- Los favoritos se almacenan como array de IDs de Pokémon por usuario
3. Asegúrate de usar `npm start` como comando de inicio.
4. Si usas MongoDB Atlas, no dejes la contraseña en el repositorio.
