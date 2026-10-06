# Frontend — Gestión Escolar

Aplicación **Vue 3 + Quasar** con login y CRUD completo de los tres modelos del
backend (`Usuario`, `Curso`, `Aprendiz`).

Stack (configurado según `../Configuracion Tecnologias Frontend SENA.md`):

| Tecnología | Rol |
|---|---|
| **Vue 3** (`<script setup>`) | Componentes y reactividad |
| **Vue Router** | Navegación (historial tipo hash) + guardia de sesión |
| **Pinia** + `pinia-plugin-persistedstate` | Estado global persistido en `localStorage` |
| **Quasar** | Librería de UI: layout, tablas, diálogos, botones |
| **Axios** | Peticiones HTTP + interceptor del token |
| **SweetAlert2** | Alertas y confirmaciones |
| **Vite** | Servidor de desarrollo y build |

Lenguajes base: **JavaScript, HTML y CSS** (sin TypeScript).

---

## 1. Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:5173
```

Requisito: el backend corriendo en `http://localhost:4500` con datos
(`npm run seed` la primera vez). La URL de la API vive en `.env`:

```
VITE_API_URL=http://localhost:4500/api
```

> Al cambiar el `.env` hay que reiniciar `npm run dev`.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualiza el build |
| `npm run deploy:backend` | Build + copia `dist/` a `../Backend Prueba/public` |

---

## 2. Estructura

```
Frontend/
├── index.html                  ← Contiene #app y carga /src/main.js
├── vite.config.js              ← Plugins de Vue + Quasar
├── .env                        ← VITE_API_URL
├── public/                     ← Páginas de error estáticas (404, 401, ...)
│   ├── error.css
│   └── 404.html · 401.html · 403.html · 500.html · 503.html
└── src/
    ├── main.js                 ← Orden: estilos → Quasar → Pinia → Router
    ├── App.vue                 ← Layout (header, menú, footer) y rutas hijas
    ├── style.css               ← Estilos globales
    ├── quasar-variables.sass   ← Paleta del tema
    ├── routes/routes.js        ← Rutas + guardia de sesión + títulos
    ├── stores/                 ← Estado global (Pinia)
    │   ├── auth.store.js       ← Sesión (persistida)
    │   ├── usuarios.store.js   ← Lista + CRUD
    │   ├── cursos.store.js
    │   └── aprendices.store.js
    ├── services/               ← Capa que habla con el backend
    │   ├── api.js              ← Instancia axios + interceptores
    │   ├── auth.service.js · usuarios.service.js
    │   ├── cursos.service.js · aprendices.service.js
    ├── helpers/
    │   ├── errorHandler.js     ← Catálogo de páginas de error y mensajes
    │   ├── alertas.js          ← SweetAlert2 (nunca window.alert/confirm)
    │   └── formato.js          ← Fechas y estados
    ├── components/             ← Piezas reutilizables
    │   ├── ErrorCard.vue       ← Tarjeta de error a pantalla completa
    │   ├── AlertaError.vue     ← Banner de error con "Reintentar"
    │   └── FormCurso.vue · FormAprendiz.vue · FormUsuario.vue
    └── views/                  ← Una pantalla por ruta
        ├── Login.vue · Inicio.vue · Error.vue
        ├── Usuarios.vue · Cursos.vue · Aprendices.vue
```

**Regla de responsabilidades:** la vista *pinta* y llama acciones; la store
*guarda el estado*; el servicio *sabía la URL*; el backend *valida*. Cada capa
hace una sola cosa.

---

## 3. Reglas del proyecto (importantes)

### Sin validaciones de HTML ni diálogos nativos

- **No** existen atributos `required`, `pattern`, `minlength`, ni las reglas
  `rules` de Quasar, ni `window.alert` / `window.confirm` / `window.prompt`.
- **Quien valida es el backend.** El frontend solo *muestra* lo que el backend
  responde (`400` con `{ msg, errors: [] }`) usando **SweetAlert2**.
- Las confirmaciones (cerrar sesión, desactivar un registro) también son
  SweetAlert2.

### Errores con página propia (estilo GitHub)

| Situación | Qué se ve |
|---|---|
| URL inexistente | `404` a pantalla completa |
| Sin token / sesión vencida | `401` con botón a Iniciar sesión |
| Sin permisos | `403` |
| Error del servidor | `500` con "Intentar de nuevo" |
| Backend apagado | `503` con "Intentar de nuevo" |

Hay dos niveles a propósito:

1. **Dentro del SPA**: `views/Error.vue` + `components/ErrorCard.vue`, con las
   rutas `/error/:codigo` y un catch-all que redirige a `/error/404`.
2. **Páginas estáticas** en `public/` (`404.html`, `501`...): HTML + CSS puro,
   se sirven aunque Vue nunca arranque (útiles en el backend y en cualquier
   hosting).

Todo el criterio está centralizado en `helpers/errorHandler.js`
(`PAGINAS_DE_ERROR`, `codigoDeError`, `irAError`, `mensajeDeError`).

### Sesión

1. `POST /api/usuarios/login` → `{ usuario, token }`.
2. Se guarda en `auth.store.js` (persistida en `localStorage`).
3. El interceptor de `services/api.js` inyecta `x-token` en cada petición.
4. Si el backend responde `401`, se cierra la sesión automáticamente y se va a
   la página `401`.

---

## 4. Cómo agregar el CRUD de un modelo nuevo

1. `services/nuevo.service.js` → un método por endpoint del backend.
2. `stores/nuevo.store.js` → `listar()`, `crear()`, `actualizar()`,
   `cambiarEstado()` con `cargando` y `error`.
3. `components/FormNuevo.vue` → diálogo con los campos (sin validaciones).
4. `views/Nuevo.vue` → tabla, buscador, filtro y acciones.
5. Registrar la ruta en `src/routes/routes.js` y la opción en el menú de
   `App.vue`.

---

## 5. Verificación rápida

```bash
npm run build      # debe compilar sin errores
npm run dev        # y probar en el navegador
```

Checklist manual: login → las 3 vistas CRUD (crear, editar, buscar,
activar/desactivar) → recargar la página (la sesión persiste) → cerrar sesión →
escribir una URL inexistente (404) → apagar el backend y recargar (503).
