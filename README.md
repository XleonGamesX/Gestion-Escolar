# Gestión Escolar

Aplicación de gestión escolar: **Frontend Vue 3 + Quasar** y **Backend Express + MongoDB**.

- Login con JWT, roles y persistencia de sesión.
- CRUD de **Usuarios**, **Cursos** y **Aprendices** con filtros, validaciones y alertas.
- Paleta y tipografía inspiradas en la Plataforma Integra.

---

## Estructura

```
.
├── Frontend/              # App Vue 3 + Quasar (Vite)
│   ├── public/            # Páginas de error estáticas (401, 403, 404, 500, 503)
│   ├── src/
│   │   ├── views/         # Login, Inicio, Usuarios, Cursos, Aprendices
│   │   ├── components/    # Diálogos de formulario y tarjetas de error
│   │   ├── stores/        # Pinia (+ persistencia)
│   │   ├── services/      # Instancia única de axios (api.js)
│   │   └── helpers/       # alertas.js, errorHandler.js, ...
│   ├── .env               # Local: VITE_API_URL=http://localhost:4500/api
│   └── .env.example
│
├── Backend Prueba/        # API Express + Mongoose
│   ├── routes/            # /api/usuarios, /api/cursos, /api/aprendices
│   ├── controllers/  models/  middlewares/  helpers/
│   ├── scripts/seed.js    # Crea el usuario administrador de prueba
│   └── .env.example
│
├── render.yaml            # Blueprint de Render (build, start y variables)
└── package.json           # Scripts de local (dev) y de despliegue (Render)
```

---

## Correr en local

Requisitos: Node.js 20+ y MongoDB (local o Atlas).

```bash
# 1) Backend
cd "Backend Prueba"
npm install
cp .env.example .env      # y completar MONGO_URL y SECRETORPRIVATEKEY
npm run seed              # crea admin@sena.edu.co / 123456
npm run dev               # http://localhost:4500

# 2) Frontend (otra terminal)
cd Frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:4500/api
npm run dev               # http://localhost:5173
```

> `npm run deploy:backend` compila el frontend y lo copia a
> `Backend Prueba/public`, para servir todo desde un solo puerto.

---

## Desplegar en Render (frontend + API en un solo servicio)

Un **único Web Service** de Express sirve la API (`/api/*`) y el frontend ya
compilado desde `Backend Prueba/public`, todo en el mismo puerto y dominio
(sin CORS, sin segundo servicio).

1. Subí el proyecto a GitHub (ya está en este repositorio).
2. Entrá a [render.com](https://render.com) → **New +** → **Web Service**
   → conectá este repositorio.
3. Dejá estos valores (si dejaste vacío Root Directory, Render usa la raíz):

   | Campo | Valor |
   |---|---|
   | Root Directory | *(vacío = raíz del repo)* |
   | Runtime | Node |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |

4. Agregá las **Environment**:

   | Variable | Valor | Para qué |
   |---|---|---|
   | `MONGO_URL` | la URI de MongoDB Atlas | conexión a la base |
   | `SECRETORPRIVATEKEY` | misma clave que en `Backend Prueba/.env` | firma de los JWT |
   | `NODE_VERSION` | `22` | Vite 8 exige Node 20.19+ o 22.12+ |

5. **Create Web Service**. La URL queda tipo `gestion-escolar.onrender.com`.

> También podés usar el **Blueprint**: el repo trae `render.yaml` con estos
> mismos valores, y Render lo detecta al importar el repositorio.

### Qué hace cada paso del despliegue

- `npm install` (raíz) deja npm listo; el código real vive en dos carpetas
  con su propio `package.json`: `Backend Prueba` y `Frontend`.
- `npm run build` ejecuta `scripts/desplegar-render.js`: instala las
  dependencias del backend y del frontend, compila el frontend
  (`Frontend/dist`) y **copia ese build a `Backend Prueba/public`**.
- `npm start` arranca Express directamente con node
  (`node "Backend Prueba/app.js"`) en `process.env.PORT` (Render lo define),
  sirviendo `/api/*` y el frontend desde `public/`.

### MongoDB Atlas (paso obligatorio)

Render ejecuta la API desde sus propias IPs, que cambian. En
**MongoDB Atlas → Network Access → IP Access List** agregá `0.0.0.0/0`
(todas las IPs). Sin eso la API no va a poder conectarse a la base.

### Comprobar que salió bien

| URL | Qué debe responder |
|---|---|
| `https://<app>.onrender.com/life` | `El servidor esta funcionando` |
| `https://<app>.onrender.com/` | la pantalla de login |
| Login `admin@sena.edu.co` / `123456` | entra a Inicio |

> El plan gratuito duerme el servicio tras un rato sin uso: el primer arranque
> tarda ~1 minuto. No es un error de la app.

### El error 404 del login (ya corregido)

El motivo clásico de este fallo: el build se hacía **sin** `VITE_API_URL`
porque el `.env` del frontend no viaja al servidor (está en `.gitignore`).
Sin esa variable axios usaba rutas relativas (`/usuarios/login`) y el backend
solo conoce `/api/usuarios/login`, así que devolvía 404.

Hoy hay una protección: en `src/services/api.js` el baseURL está escrito a mano
con su fallback, `import.meta.env.VITE_API_URL || "/api"`. Como `"/api"` no
depende de ninguna variable de entorno, el build sale correcto aunque no
exista ningún `.env`, y el backend (que sirve el frontend en el mismo dominio)
responde en `/api/usuarios/login`.

### Cómo quedó armado

- El build del frontend termina en `Backend Prueba/public`, que Express sirve
  con `express.static` y con el catch-all `app.get("*")` de `server.js`.
- El frontend usa rutas hash (`/#/cursos`), así que no hace falta ningún
  fallback extra de rutas en el servidor.
- `dotenv` en `server.js` y `database.js` carga el `.env` con ruta absoluta
  (relativa a cada archivo), no desde el directorio de trabajo. En Render no
  hay `.env`: mandan las variables del dashboard.
- **Cada push a `main` vuelve a desplegar.**

---

## Usuario de prueba

| Campo | Valor |
|---|---|
| Correo | `admin@sena.edu.co` |
| Contraseña | `123456` |

Creado por `npm run seed`. Cambialo antes de exponer la app.
