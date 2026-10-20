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
│   └── .env.example
│
├── Backend Prueba/        # API Express + Mongoose
│   ├── routes/            # /api/usuarios, /api/cursos, /api/aprendices
│   ├── controllers/  models/  middlewares/  helpers/
│   ├── scripts/seed.js    # Crea el usuario administrador de prueba
│   └── .env.example
│
├── api/index.js           # Entrada de la API para Vercel (serverless)
├── vercel.json            # Build del frontend + rewrites de /api/*
└── package.json           # Dependencias que instala Vercel (API)
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

## Desplegar en Vercel (frontend + API)

El repo ya trae `vercel.json` y `api/index.js`: el frontend se compila con
Vite y `/api/*` se redirige a la misma app Express que corre en local.

1. Subí el proyecto a GitHub (ya está en este repositorio).
2. Entrá a [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
   → elegí este repositorio.
3. **No toques Root Directory** (dejalo en `/`) ni Build & Output: los valores
   vienen de `vercel.json`. Framework: *Other / Vite*.
4. Agregá las **Environment Variables**:

   | Variable | Valor | Para qué |
   |---|---|---|
   | `MONGO_URL` | la URI de MongoDB Atlas | conexión a la base |
   | `SECRETORPRIVATEKEY` | misma clave que en `Backend Prueba/.env` | firma de los JWT |
   | `VITE_API_URL` | `/api` | el frontend llama a la API de su mismo dominio |

5. **Deploy**. La URL queda tipo `gestion-escolar.vercel.app`.

### MongoDB Atlas (paso obligatorio)

Vercel ejecuta la API desde sus propias IPs, que cambian. En
**MongoDB Atlas → Network Access → IP Access List** agregá `0.0.0.0/0`
(todas las IPs). Sin eso la API no va a poder conectarse a la base.

### Cómo quedó armado

- `api/index.js` exporta la instancia de Express de `Backend Prueba/server.js`
  **sin** llamar a `app.listen()`, que Vercel no permite.
- `vercel.json` redirige `/api/:path*` → `/api/index`; Express recibe el path
  original (`/api/usuarios/login`), así que no hay que repetir rutas.
- Los archivos estáticos (incluidas las páginas de error) los sirve el CDN de
  Vercel desde `Frontend/dist`; `express.static` queda ignorado, como indica
  la documentación de Vercel para Express.
- **Cada push a `main` vuelve a desplegar.**

---

## Usuario de prueba

| Campo | Valor |
|---|---|
| Correo | `admin@sena.edu.co` |
| Contraseña | `123456` |

Creado por `npm run seed`. Cambialo antes de exponer la app.
