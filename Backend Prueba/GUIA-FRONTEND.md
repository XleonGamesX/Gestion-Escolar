# Guía: conectar un frontend Vue 3 con este backend

Objetivo: que el aprendiz entienda **quién habla con quién** y **dónde se escribe cada cosa**.

---

## 0. La idea en una frase

El backend y el frontend son **dos programas separados**, en **dos puertos
distintos**, que se comunican por **HTTP enviando JSON**.

```
Vue (http://localhost:5173)  ──── HTTP + JSON ────>  Express (http://localhost:4500)
                             <───────────────────                    │
                                                                      ▼
                                                                  MongoDB
```

El backend **no** sabe nada de Vue. El frontend **no** sabe nada de Mongo.
Lo único que comparten es el **contrato**: la URL, el método y la forma del JSON.

---

## 1. Antes de escribir Vue: probar la API sola

Nunca conectes el frontend a un endpoint que no has probado. Usa el navegador,
Postman o Thunder Client (extensión de VS Code):

- `GET  http://localhost:4500/api/cursos` → debe responder `[]`
- `POST http://localhost:4500/api/cursos/register` con body JSON → debe responder `{ "msg": ... }`

Si esto no funciona, **el problema no es de Vue**.

---

## 2. CORS: el error #1 que van a encontrar

El navegador bloquea por seguridad las peticiones entre orígenes distintos
(puerto 5173 → puerto 4500). Por eso el backend tiene en `server.js`:

```js
this.app.use(cors());
```

`cors()` sin parámetros permite a cualquier origen. Para producción se restringe:

```js
this.app.use(cors({ origin: process.env.URL_FRONTEND }));
```

> Si ven en consola *"has been blocked by CORS policy"*, el error se arregla en
> el **backend**, no en el frontend.

---

## 3. Crear el proyecto Vue

```bash
npm create vite@latest frontend-prueba -- --template vue
cd frontend-prueba
npm install
npm install axios
npm run dev
```

---

## 4. La URL de la API va en variables de entorno, nunca "quemada"

`frontend-prueba/.env`:

```
VITE_API_URL=http://localhost:4500/api
```

> En Vite las variables **deben** empezar con `VITE_` para ser visibles en el código.
> Se leen con `import.meta.env.VITE_API_URL`. Al cambiar el `.env` hay que
> reiniciar `npm run dev`.

---

## 5. Una sola instancia de axios (capa de configuración)

`src/services/api.js`:

```js
import axios from "axios";

// Instancia unica: si mañana cambia la URL del backend, se cambia en UN solo lugar.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:4500/api
  headers: { "Content-Type": "application/json" },
});

export default api;
```

**Este backend ya pide token** (ver la sección de autenticación del README): todo
`/api/cursos` y `/api/aprendices` responde `401` si no llega la cabecera
`x-token`. El interceptor es el lugar donde se inyecta, una sola vez, para todas
las peticiones:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // el que devolvio POST /usuarios/login
  if (token) config.headers["x-token"] = token;
  return config;
});
```

> El primer paso del frontend, entonces, es la pantalla de login: sin token no
> se puede listar ni un curso. En el proyecto `estructura_frontend` ese token se
> guarda en un store de Pinia persistido, en vez de escribir `localStorage` a
> mano.

---

## 6. Una capa de servicios por modelo

Los componentes **no** llaman a axios directamente. Llaman a un servicio.
Así, si cambia una ruta del backend, se toca un solo archivo.

`src/services/cursos.service.js`:

```js
import api from "./api";

export const cursosService = {
  listar: (status) => api.get("/cursos", { params: { status } }),
  obtener: (id) => api.get(`/cursos/${id}`),
  crear: (data) => api.post("/cursos/register", data),
  actualizar: (id, data) => api.put(`/cursos/update/${id}`, data),
  activar: (id) => api.put(`/cursos/active/${id}`),
  desactivar: (id) => api.put(`/cursos/inactive/${id}`),
};
```

`src/services/aprendices.service.js`:

```js
import api from "./api";

export const aprendicesService = {
  listar: () => api.get("/aprendices"),
  porCurso: (cursoId) => api.get(`/aprendices/curso/${cursoId}`),
  crear: (data) => api.post("/aprendices/register", data),
  actualizar: (id, data) => api.put(`/aprendices/update/${id}`, data),
  desactivar: (id) => api.put(`/aprendices/inactive/${id}`),
};
```

Fíjense que **cada método del servicio es un espejo exacto de una fila de la
tabla de endpoints del README**.

---

## 7. Consumirlo en un componente

`src/components/ListaCursos.vue`:

```vue
<script setup>
import { ref, onMounted } from "vue";
import { cursosService } from "../services/cursos.service";

const cursos = ref([]);
const cargando = ref(false);
const error = ref("");

const cargarCursos = async () => {
  cargando.value = true;
  error.value = "";
  try {
    const { data } = await cursosService.listar();
    cursos.value = data; // el backend devuelve el array directo
  } catch (e) {
    error.value = e.response?.data?.msg || "Error al cargar los cursos";
  } finally {
    cargando.value = false;
  }
};

// onMounted: se ejecuta cuando el componente ya esta en pantalla.
onMounted(cargarCursos);
</script>

<template>
  <h2>Cursos</h2>
  <p v-if="cargando">Cargando...</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="curso in cursos" :key="curso._id">
      {{ curso.codigo }} — {{ curso.nombre }} ({{ curso.duracion }} h)
    </li>
  </ul>
</template>
```

**Tres estados siempre**: cargando, error, datos. Un formulario o lista que solo
maneja el caso feliz está incompleto.

---

## 8. Enviar datos y mostrar los errores de validación del backend

El backend responde `400` con `{ msg, errors: [...] }`. Hay que **mostrar esos
mensajes**, no solo un "algo salió mal".

`src/components/FormAprendiz.vue`:

```vue
<script setup>
import { ref, onMounted } from "vue";
import { aprendicesService } from "../services/aprendices.service";
import { cursosService } from "../services/cursos.service";

const form = ref({ documento: "", nombre: "", email: "", curso: "" });
const cursos = ref([]);
const errores = ref([]);
const mensaje = ref("");

onMounted(async () => {
  const { data } = await cursosService.listar(0); // solo cursos activos
  cursos.value = data;
});

const guardar = async () => {
  errores.value = [];
  mensaje.value = "";
  try {
    const { data } = await aprendicesService.crear(form.value);
    mensaje.value = data.msg;
    form.value = { documento: "", nombre: "", email: "", curso: "" };
  } catch (e) {
    // 400 de validacion -> lista de mensajes; cualquier otro -> mensaje generico
    errores.value = e.response?.data?.errors || [
      e.response?.data?.msg || "Error de conexion con el servidor",
    ];
  }
};
</script>

<template>
  <form @submit.prevent="guardar">
    <input v-model="form.documento" placeholder="Documento" />
    <input v-model="form.nombre" placeholder="Nombre" />
    <input v-model="form.email" placeholder="Email" />

    <select v-model="form.curso">
      <option value="">Seleccione un curso</option>
      <option v-for="c in cursos" :key="c._id" :value="c._id">
        {{ c.nombre }}
      </option>
    </select>

    <button type="submit">Guardar</button>
  </form>

  <p v-if="mensaje" class="ok">{{ mensaje }}</p>
  <ul v-if="errores.length" class="error">
    <li v-for="(err, i) in errores" :key="i">{{ err }}</li>
  </ul>
</template>
```

> **Clave del `<select>`**: el `value` es `c._id` porque el backend espera el
> **ObjectId** del curso, no su nombre. Esa es toda la relación entre los dos
> modelos vista desde el frontend.

Y al listar aprendices, gracias al `populate` del backend:

```vue
<li v-for="a in aprendices" :key="a._id">
  {{ a.nombre }} — {{ a.curso?.nombre }}
</li>
```

El `?.` evita que reviente si un aprendiz quedó sin curso.

---

## 9. Errores frecuentes y cómo leerlos

| Síntoma | Causa real | Dónde se arregla |
|---|---|---|
| `blocked by CORS policy` | Falta `cors()` o el origen no está permitido | Backend `server.js` |
| `ERR_CONNECTION_REFUSED` | El backend no está corriendo o es otro puerto | Terminal del backend / `.env` |
| `404 La ruta solicitada no existe` | La URL no coincide (¿olvidaste `/register`? ¿`/api`?) | `services/*.js` vs README |
| `400 Error en la validacion` | Faltan campos o son inválidos | Revisar `errors[]` en la respuesta |
| El body llega vacío al backend | Falta `express.json()` o se envió FormData | Backend `middlewares()` |
| `undefined` al pintar `curso.nombre` | Endpoint sin `.populate()` | Backend controller |

**Herramienta obligatoria:** pestaña **Network** del navegador (F12). Ahí se ve la
URL exacta, el body enviado, el status y la respuesta. El 90% de los errores se
diagnostican ahí en 10 segundos.

---

## 10. Ejercicio propuesto para los aprendices

1. Levantar el backend y crear 2 cursos desde Postman.
2. Crear el proyecto Vue y listar esos cursos en pantalla.
3. Hacer el formulario de aprendiz con el `<select>` de cursos.
4. Provocar un error a propósito (email inválido) y mostrar el mensaje del backend.
5. Agregar el botón "Desactivar" y refrescar la lista después de la operación.
6. **Reto:** agregar al backend un tercer modelo `Instructor` siguiendo la receta
   de la sección 5 del README, y consumirlo desde Vue.
