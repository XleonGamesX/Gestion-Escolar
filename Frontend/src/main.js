// ── 1. IMPORTACIONES ──────────────────────────────────────────────
import { createApp } from "vue"; // Crea la app de Vue
import { createPinia } from "pinia"; // Gestor de estado global
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"; // Persistencia
import { Quasar } from "quasar"; // Framework de UI
import App from "./App.vue"; // Componente raíz
import { router } from "./routes/routes.js"; // Rutas del proyecto

// ── 2. ESTILOS GLOBALES ───────────────────────────────────────────
import "@quasar/extras/material-icons/material-icons.css"; // Iconos Material
import "quasar/src/css/index.sass"; // CSS base de Quasar
// style.css va DESPUES de Quasar: asi las reglas propias (tablas,
// botones, alertas) ganan en la cascada sin necesidad de !important.
import "./style.css"; // Estilos propios del proyecto

// ── 3. CREAR INSTANCIAS ───────────────────────────────────────────
const pinia = createPinia(); // Instancia de Pinia
const app = createApp(App); // Instancia de Vue con App.vue

// ── 4. REGISTRO DE PLUGINS (el orden importa) ─────────────────────
app.use(Quasar, { plugins: {} }); // 4.1 Componentes <q-*>
app.use(pinia); // 4.2 Pinia disponible
pinia.use(piniaPluginPersistedstate); // 4.3 Persistencia en localStorage
app.use(router); // 4.4 <router-view> + guardias de sesión

// ── 5. MONTAR LA APLICACIÓN ───────────────────────────────────────
app.mount("#app"); // Vue inserta App.vue en #app
