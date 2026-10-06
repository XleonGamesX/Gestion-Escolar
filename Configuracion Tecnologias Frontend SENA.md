# Configuración de Tecnologías Frontend (SENA)

Guía reproducible de la configuración usada en el proyecto **Tienda**.
El objetivo de este documento es que cualquier persona **o agente de IA** pueda
recrear exactamente la misma configuración en un proyecto nuevo, desde cero,
siguiendo los comandos, la estructura de carpetas y el contenido de cada archivo.

---

## 1. Descripción general y stack

| Tecnología | Versión instalada | Rol en el proyecto |
|---|---|---|
| **Vue** | `3.5.42` | Framework base: componentes, reactividad, `ref`, `<script setup>`. |
| **Vue Router** | `4.6.4` | Navegación entre vistas (`/`, `/ventas`, `/compras`) con `<router-view>`. |
| **Quasar** | `2.28.0` | Librería de UI: layout, header, drawer, footer, botones, badges. |
| **@quasar/extras** | `^2.0.4` | Iconos (Material Icons) y fuentes adicionales de Quasar. |
| **Pinia** | `4.0.3` | Gestión de estado global (contador del carrito compartido entre vistas). |
| **pinia-plugin-persistedstate** | `4.7.1` | Persiste el estado de las stores en `localStorage`. |
| **Vite** | `8.2.2` | Servidor de desarrollo y build de producción. |
| **@vitejs/plugin-vue** | `^6.0.8` | Compila los archivos `.vue` (SFC) para Vite. |
| **@quasar/vite-plugin** | `^2.0.2` | Integra Quasar con Vite (variables Sass, `transformAssetUrls`). |
| **sass-embedded** | `^1.103.1` | Compilador Sass necesario por los `.sass` de Quasar. |

**Cómo se combinan:**

```
index.html  →  src/main.js  →  createApp(App)
                                ├── app.use(Quasar)      ← UI
                                ├── app.use(pinia)       ← estado global
                                ├── app.use(router)      ← navegación
                                └── app.mount('#app')    ← Vue toma el DOM
```

---

## 2. Comandos usados (de cero)

### 2.1 Crear el proyecto

```bash
npm create vite@latest tienda -- --template vue
cd tienda
npm install
```

- `npm create vite@latest`: genera el proyecto base de Vite con plantilla Vue 3.
- `--template vue`: selecciona la plantilla JavaScript (no TypeScript).
- `npm install`: instala Vue y Vite a partir del `package.json` generado.

### 2.2 Instalar Quasar

```bash
npm install quasar @quasar/extras
npm install -D @quasar/vite-plugin sass-embedded
```

- `quasar`: componentes de UI (QLayout, QBtn, QDrawer, QBadge…).
- `@quasar/extras`: iconos y fuentes (`material-icons.css`).
- `@quasar/vite-plugin` (**dev**): conecta Quasar con Vite y permite inyectar variables Sass.
- `sass-embedded` (**dev**): compilador Sass; Quasar está escrito en `.sass`.

### 2.3 Instalar Vue Router

```bash
npm install vue-router
```

### 2.4 Instalar Pinia y su plugin de persistencia

```bash
npm install pinia pinia-plugin-persistedstate
```

### 2.5 Scripts de ejecución (`package.json`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo de Vite (`http://localhost:5173`). |
| `npm run build` | Genera el build de producción en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente el build generado en `dist/`. |

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### 2.6 `package.json` final

```json
{
  "name": "quasar",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@quasar/extras": "^2.0.4",
    "pinia": "^4.0.3",
    "pinia-plugin-persistedstate": "^4.7.1",
    "quasar": "^2.28.0",
    "vue": "^3.5.41",
    "vue-router": "^4.6.4"
  },
  "devDependencies": {
    "@quasar/vite-plugin": "^2.0.2",
    "@vitejs/plugin-vue": "^6.0.8",
    "sass-embedded": "^1.103.1",
    "vite": "^8.2.2"
  }
}
```

> **Regla importante:** todo lo que es UI/herramienta de compilación va en
> `devDependencies`; todo lo que se usa en tiempo de ejecución (Vue, Quasar,
> Pinia, Router) va en `dependencies`.

---

## 3. Estructura de carpetas y archivos

```
Tienda/
│
├── index.html                         ← Punto de entrada HTML (contiene #app)
├── package.json                       ← Dependencias y scripts
├── package-lock.json                  ← Versión exacta de cada dependencia
├── vite.config.js                     ← Configuración de Vite + plugins
├── quasar.rar                         ← Respaldo comprimido del proyecto
│
├── public/
│   ├── favicon.svg                    ← Ícono del navegador
│   └── icons.svg                      ← Iconos compartidos
│
└── src/
    ├── main.js                        ← Ensamblado: Vue + Quasar + Pinia + Router
    ├── App.vue                        ← Componente raíz (layout Quasar)
    ├── style.css                      ← Estilos globales
    ├── quasar-variables.sass          ← Personalización del tema de Quasar
    │
    ├── routes/
    │   └── routes.js                  ← Definición de rutas y tipo de historial
    │
    ├── stores/
    │   └── stores.js                  ← Stores de Pinia con persistencia
    │
    ├── views/
    │   ├── Productos.vue              ← Vista de la ruta "/"
    │   ├── Ventas.vue                 ← Vista de la ruta "/ventas"
    │   └── Compras.vue                ← Vista de la ruta "/compras"
    │
    └── assets/
        ├── hero.png
        ├── vite.svg
        └── vue.svg
```

**Responsabilidad de cada archivo:**

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Contiene el `<div id="app">` y carga `/src/main.js` como módulo. |
| `vite.config.js` | Registra los plugins de compilación (Vue + Quasar). |
| `src/main.js` | Único lugar donde se registran las librerías (`app.use(...)`). |
| `src/App.vue` | Layout general: header, menú lateral, contenedor de rutas y footer. |
| `src/routes/routes.js` | Mapea URL → componente. |
| `src/stores/stores.js` | Estado compartido entre vistas. |
| `src/views/*.vue` | Una pantalla por ruta. |
| `src/quasar-variables.sass` | Colores del tema (`$primary`, `$secondary`, etc.). |

**Convenciones usadas (replicables):**

- Las carpetas son en plural: `routes/`, `stores/`, `views/`, `assets/`.
- Los archivos de configuración van en minúsculas: `routes.js`, `stores.js`.
- Una vista = un archivo `.vue` dentro de `views/`.
- El estado global va en `stores/`, nunca dentro de las vistas.

---

## 4. Configuración de Vue

Vue se configura en **tres puntos**: `vite.config.js` (compilación),
`index.html` (montaje en el DOM) y `main.js` (creación de la aplicación).

### 4.1 `vite.config.js` — plugin de Vue

```js
import vue from '@vitejs/plugin-vue'          // Plugin que compila los .vue
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }        // Traduce src/href de las plantillas
                                                // a imports que Vite pueda resolver
    }),
    quasar({
      sassVariables: join(import.meta.dirname, 'src/quasar-variables.sass')
    })
  ],
})
```

- `defineConfig(...)`: función de Vite para escribir la configuración con
  autocompletado/Tipado.
- `plugins`: lista de plugins que transforman el código durante el build.
- `transformAssetUrls`: **obligatorio con Quasar**, hace que atributos como
  `src="img.png"` dentro de plantillas se conviertan en imports y se empaqueten.
- `import.meta.dirname`: ruta absoluta de la carpeta del proyecto (más portable
  que `__dirname` en ESM).
- `"type": "module"` en `package.json` permite usar `import`/`export` en los
  archivos de configuración.

### 4.2 `index.html` — punto de entrada

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>quasar</title>
  </head>
  <body>
    <div id="app"></div>                      <!-- Nodo donde Vue se monta -->
    <script type="module" src="/src/main.js"></script>  <!-- Entrada de la app -->
  </body>
</html>
```

- `#app`: es el **único** elemento que Vue controla; todo lo demás lo renderiza.
- `type="module"`: permite usar módulos ES (`import`) en el navegador/Vite.
- Rutas absolutas (`/src/main.js`, `/favicon.svg`) se resuelven desde `public/` y la raíz del proyecto.

### 4.3 `src/main.js` — creación y montaje

```js
import { createApp } from 'vue'    // Crea la instancia de la aplicación Vue
import App from './App.vue'        // Componente raíz

const app = createApp(App)         // Asocia el componente raíz a la app
app.mount('#app')                  // La inserta en el <div id="app"> del HTML
```

### 4.4 Componentes con `<script setup>` (Composition API)

```vue
<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)          // Estado reactivo
function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value   // Se modifica con .value
}
</script>
```

- `<script setup>`: azúcar sintáctico de la Composition API; todo lo declarado
  arriba queda disponible en el `<template>` **sin necesidad de `return`**.
- `ref()`: hace reactivo al valor; en el template se usa directo (`leftDrawerOpen`),
  en el script se accede con `.value`.

---

## 5. Configuración de Quasar

Quasar se configura en **cuatro lugares**: imports globales, plugin en Vite,
registro en `main.js` y variables del tema.

### 5.1 `src/main.js` — estilos globales

```js
// Import icon libraries (iconos de Material Design)
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css (estilos base del framework)
import 'quasar/src/css/index.sass'
```

- Se importan **antes** de registrar el plugin para que los estilos estén
  disponibles en toda la aplicación.
- Los iconos se usan por nombre: `icon="menu"`, `icon="local_grocery_store"`.

### 5.2 `src/main.js` — registro del plugin

```js
import { Quasar } from 'quasar'

app.use(Quasar, {
  plugins: {},   // Aquí se agregan plugins como Dialog, Notify, Loading...
})
```

- `app.use(Quasar, {...})`: habilita los componentes `<q-*>` en todas las plantillas.
- `plugins: {}`: para usar `useDialog()`, `Notify`, `Loading`, etc., hay que
  importarlos y agregarlos aquí (ej. `import { Notify } from 'quasar'` →
  `plugins: { Notify }`).

### 5.3 `vite.config.js` — variables del tema

```js
import { quasar } from '@quasar/vite-plugin'

quasar({
  sassVariables: join(import.meta.dirname, 'src/quasar-variables.sass')
})
```

- Inyecta las variables Sass en **cada** archivo `.sass` de Quasar, evitando
  recompilar todo el framework y permitiendo personalizar el tema.

### 5.4 `src/quasar-variables.sass`

```sass
$primary   : #1976D2      // Color principal (q-bg-primary, q-btn color="primary")
$secondary : #26A69A
$accent    : #9C27B0

$dark      : #1D1D1D

$positive  : #21BA45
$negative  : #C10015
$info      : #31CCEC
$warning   : #F2C037
```

- Estas variables generan las utilidades CSS: `bg-primary`, `text-secondary`,
  `bg-positive`, etc.

### 5.5 Estructura de layout en `App.vue`

```vue
<template>
  <q-layout view="hHh lpR fFf">        <!-- Definición del layout:
                                              hHh = header fijo con altura fija
                                              lpR = drawer izquierdo permanente
                                              fFf = footer fijo con altura fija -->

    <q-header elevated class="bg-primary text-white">   <!-- Barra superior -->
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="q-pa-md row justify-end">
          <q-btn flat round icon="local_grocery_store">
            <q-badge color="orange" floating>{{ useCarrito.contadorCarrito }}</q-badge>
          </q-btn>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay behavior="mobile" bordered>
      <q-btn to="/">Productos</q-btn><br>
      <q-btn to="/ventas">Ventas</q-btn><br>
      <q-btn to="/compras">Compras</q-btn><br>
    </q-drawer>

    <q-page-container>                 <!-- Contenedor donde viven las rutas -->
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">    <!-- Barra inferior -->
      <q-toolbar>...</q-toolbar>
    </q-footer>

  </q-layout>
</template>
```

**Componentes Quasar usados:**

| Componente | Función |
|---|---|
| `q-layout` | Estructura maestra de la página. |
| `q-header` / `q-footer` | Barras superior e inferior. |
| `q-toolbar` / `q-toolbar-title` | Filas de herramientas y títulos. |
| `q-drawer` | Menú lateral desplegable (`v-model` lo abre/cierra). |
| `q-page-container` | Espacio central donde se renderiza `<router-view>`. |
| `q-btn` | Botón; con `to="..."` navega como router-link. |
| `q-badge` | Insignia (contador del carrito); `floating` la posiciona sobre el ícono. |
| `q-avatar` | Imagen circular. |

**Estilos de utilidad (Quasar):** `bg-primary`, `text-white`, `q-pa-md`
(padding), `row justify-end` (flexbox), `elevated` (sombra), `bordered` (borde).

---

## 6. Configuración de Vue Router

### 6.1 `src/routes/routes.js` — archivo completo

```js
import Compras from "../views/Compras.vue"      // Vista de /compras
import Ventas from "../views/Ventas.vue"        // Vista de /ventas
import Productos from "../views/Productos.vue"  // Vista de /
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router"

// Arreglo de rutas: cada objeto une un path con un componente
const routes = [
    { path: "/compras", component: Compras },
    { path: "/ventas",  component: Ventas },
    { path: "/",       component: Productos }   // Ruta raíz / home
]

export const router = createRouter({
    routes,                          // Las rutas definidas arriba
    history: createWebHashHistory()  // Estrategia de historial de navegación
})
```

### 6.2 Tipos de historial

| Método | URL resultante | Cuándo usarlo |
|---|---|---|
| `createWebHashHistory()` | `http://localhost:5173/#/ventas` | **Usado en este proyecto.** No requiere configuración del servidor; funciona en cualquier hosting estático. |
| `createWebHistory()` | `http://localhost:5173/ventas` | URLs limpias; exige configurar *fallback* en el servidor (`nginx`, `netlify.toml`, etc.). |

### 6.3 Registro en `src/main.js`

```js
import { router } from "./routes/routes.js"

app.use(router)    // Habilita <router-view>, <router-link>, q-btn to="..."
```

### 6.4 Navegación desde los componentes

Hay **tres formas** de navegar, y las tres se usan en `App.vue`:

```html
<!-- 1. Componente router-link de Vue Router -->
<router-link to="/">Productos</router-link>
<router-link to="/compras">Compras</router-link>

<!-- 2. Componente de Quasar con la prop "to" (interna al router) -->
<q-btn to="/">Productos</q-btn>
<q-btn to="/ventas">Ventas</q-btn>

<!-- 3. Botón HTML nativo (misma sintaxis to=) -->
<button to="/compras">Compras</button>
```

### 6.5 Renderizado de la vista activa

```html
<q-page-container>
  <router-view />     <!-- Aquí se dibuja el componente de la ruta actual -->
</q-page-container>
```

- `<router-view />` es el **placeholder**: según la URL, inserta `Productos.vue`,
  `Ventas.vue` o `Compras.vue`.
- `q-btn` y `router-link` solo cambian la URL; el encargado de pintar la vista
  es siempre `<router-view>`.

---

## 7. Configuración de Pinia

### 7.1 Registro en `src/main.js`

```js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()          // 1. Crea la instancia de Pinia

app.use(pinia)                        // 2. La registra en la app (antes de las stores)

pinia.use(piniaPluginPersistedstate)  // 3. Agrega el plugin de persistencia
```

**Orden correcto del registro:**

1. `createPinia()` → se crea la instancia.
2. `app.use(pinia)` → Vue conoce Pinia.
3. `pinia.use(plugin)` → se agregan plugins a esa instancia.
4. Luego sí se pueden definir/usar stores en los componentes.

### 7.2 `src/stores/stores.js` — definición de la store

```js
import { defineStore } from "pinia";
import { ref } from "vue";

// defineStore(id, setupFunction, options)
export const useCarritoStore = defineStore("carrito", () => {   // id único: "carrito"

    let contadorCarrito = ref(15)     // Estado reactivo de la store

    function aumCarrito() {           // Acción: aumenta el contador
        contadorCarrito.value++
    }

    function dismCarrito() {          // Acción: disminuye el contador
        contadorCarrito.value--
    }

    // Lo que se expone queda disponible en los componentes
    return {
        contadorCarrito, aumCarrito, dismCarrito
    }
},
    {
        persist: true,                // Persiste la store en localStorage
    },
)
```

**Anatomía de una *setup store* (modo Composition API):**

| Parte | Ejemplo | Equivalente en Options API |
|---|---|---|
| `id` | `"carrito"` | `id: 'carrito'` (debe ser único) |
| Estado | `ref(15)` | `state: () => ({ ... })` |
| Acciones | `function aumCarrito()` | `methods: { ... }` |
| Getters | `computed(() => ...)` | `getters: { ... }` |
| `return` | expone estado y acciones | n/a (implícito) |
| `persist: true` | guarda en `localStorage` | n/a |

- **Convención:** el nombre de la función que crea la store es
  `useXxxStore` (`useCarritoStore`), para distinguirla de una variable normal.

### 7.3 Persistencia

- `persist: true` → el plugin `pinia-plugin-persistedstate` guarda
  automáticamente el estado de `"carrito"` en `localStorage` del navegador.
- Al recargar la página, el contador conserva su último valor.
- Opciones avanzadas:

```js
{
  persist: {
    key: 'mi-tienda-carrito',      // Clave en localStorage
    storage: window.sessionStorage, // sessionStorage en vez de localStorage
    paths: ['contadorCarrito']      // Solo persiste esos campos
  }
}
```

### 7.4 Consumo de la store en un componente

```vue
<script setup>
import { useCarritoStore } from '../stores/stores'

const useCarrito = useCarritoStore()   // Instancia la store (una sola vez)
</script>

<template>
    <h1>soy Productos</h1>
    <button @click="useCarrito.aumCarrito()">Aumentar</button>
</template>
```

**Lectura del estado** (reactiva, en `App.vue`):

```html
<q-badge color="orange" floating>{{ useCarrito.contadorCarrito }}</q-badge>
```

**Escritura desde otra vista** (`Ventas.vue`):

```html
<button @click="useCarrito.dismCarrito()">Disminuir</button>
```

> **Clave:** el estado es **global**. `App.vue` muestra el badge,
> `Productos.vue` incrementa y `Ventas.vue` decrementa, y los tres ven el mismo
> valor, porque usan la misma store `"carrito"`.

---

## 8. Orden de inicialización en `src/main.js`

Archivo completo y comentado paso a paso:

```js
// ── 1. IMPORTACIONES ──────────────────────────────────────────────
import { createApp } from 'vue'                     // Crea la app de Vue
import './style.css'                                // Estilos globales del proyecto
import { Quasar } from 'quasar'                     // Framework de UI
import App from './App.vue'                         // Componente raíz
import { router } from "./routes/routes.js"         // Router (rutas del proyecto)
import { createPinia } from 'pinia'                 // Gestor de estado
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// ── 2. ESTILOS GLOBALES DE QUASAR ─────────────────────────────────
import '@quasar/extras/material-icons/material-icons.css'  // Iconos
import 'quasar/src/css/index.sass'                         // CSS de Quasar

// ── 3. CREAR INSTANCIAS ───────────────────────────────────────────
const pinia = createPinia()                         // Instancia de Pinia
const app = createApp(App)                          // Instancia de Vue con App.vue

// ── 4. REGISTRO DE PLUGINS (el orden importa) ─────────────────────
app.use(Quasar, { plugins: {} })                    // 4.1 Componentes <q-*>
app.use(pinia)                                      // 4.2 Pinia disponible
pinia.use(piniaPluginPersistedstate)                // 4.3 Plugin de persistencia
app.use(router)                                     // 4.4 <router-view> activo

// ── 5. MONTAR LA APLICACIÓN ───────────────────────────────────────
app.mount('#app')                                   // Vue inserta App.vue en #app
```

**Reglas del orden:**

1. Los **imports** siempre arriba (ESM no permite imports condicionales).
2. Los **estilos globales** se importan antes de montar.
3. `createApp(App)` antes de cualquier `app.use(...)`.
4. `app.use(pinia)` **antes** de usar cualquier store.
5. `pinia.use(plugin)` sobre la instancia ya creada.
6. `app.mount('#app')` **al final**, después de registrar todo.

**Flujo de arranque completo:**

```
index.html
  └─ <script type="module" src="/src/main.js">
       └─ main.js
            ├─ importa estilos (Quasar + iconos + style.css)
            ├─ createApp(App) + createPinia()
            ├─ app.use(Quasar) → componentes q-*
            ├─ app.use(pinia)  → stores disponibles
            ├─ pinia.use(persistedstate) → persistencia activa
            ├─ app.use(router) → rutas activas
            └─ app.mount('#app') → se pinta App.vue
                 └─ <q-layout> → <router-view> → vista según la URL
```

---

## 9. Checklist de replicación

Para llevar esta configuración a **otro proyecto nuevo**, verificar:

- [ ] Proyecto creado con `npm create vite@latest <nombre> -- --template vue`.
- [ ] `"type": "module"` presente en `package.json`.
- [ ] Dependencias instaladas: `quasar`, `@quasar/extras`, `vue-router`,
      `pinia`, `pinia-plugin-persistedstate`.
- [ ] DevDependencies instaladas: `@vitejs/plugin-vue`, `@quasar/vite-plugin`, `sass-embedded`.
- [ ] `vite.config.js` registra **ambos** plugins: `vue({ template: { transformAssetUrls } })`
      y `quasar({ sassVariables: ... })`.
- [ ] Existe `src/quasar-variables.sass` y su ruta es correcta en `vite.config.js`.
- [ ] `index.html` tiene el `<div id="app">` y carga `/src/main.js` con `type="module"`.
- [ ] `main.js` importa `material-icons.css` y `quasar/src/css/index.sass`.
- [ ] Orden en `main.js`: `Quasar` → `pinia` → `pinia.use(plugin)` → `router` → `mount`.
- [ ] `src/routes/routes.js` exporta `router` con `routes` y `history`.
- [ ] Existe `<router-view />` dentro de un `<q-page-container>` en `App.vue`.
- [ ] Cada ruta apunta a un `.vue` dentro de `src/views/`.
- [ ] Las stores viven en `src/stores/` y usan `defineStore("id", () => { ... })`.
- [ ] Las stores se consumen con `const X = useXStore()` dentro de `<script setup>`.
- [ ] Carpetas convencionales creadas: `routes/`, `stores/`, `views/`, `assets/`, `public/`.
- [ ] Verificación final: `npm run dev` sin errores y `npm run build` exitoso.
