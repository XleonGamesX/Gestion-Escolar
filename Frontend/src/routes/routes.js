import { createRouter, createWebHashHistory } from "vue-router";

import { irAError } from "../helpers/errorHandler.js";
import { useAuthStore } from "../stores/auth.store.js";
import Aprendices from "../views/Aprendices.vue";
import Cursos from "../views/Cursos.vue";
import PaginaError from "../views/Error.vue";
import Inicio from "../views/Inicio.vue";
import Login from "../views/Login.vue";
import Usuarios from "../views/Usuarios.vue";

/**
 * Mapa URL -> componente.
 *
 * Se usa historial tipo hash (`/#/cursos`) a propósito: no exige configurar
 * un fallback en el servidor y funciona igual en desarrollo y en cualquier
 * hosting estático.
 */
const routes = [
  {
    path: "/",
    name: "inicio",
    component: Inicio,
    meta: { titulo: "Inicio" },
  },
  {
    path: "/usuarios",
    name: "usuarios",
    component: Usuarios,
    meta: { titulo: "Usuarios", soloAdmin: true },
  },
  {
    path: "/cursos",
    name: "cursos",
    component: Cursos,
    meta: { titulo: "Cursos" },
  },
  {
    path: "/aprendices",
    name: "aprendices",
    component: Aprendices,
    meta: { titulo: "Aprendices" },
  },
  {
    // Login y páginas de error se ven a pantalla completa, sin menú ni footer
    path: "/login",
    name: "login",
    component: Login,
    meta: { titulo: "Iniciar sesión", pantallaCompleta: true, publica: true },
  },
  {
    path: "/error/:codigo",
    name: "error",
    component: PaginaError,
    meta: { pantallaCompleta: true, publica: true },
  },
  {
    // Cualquier URL que no exista cae aquí (404 del SPA)
    path: "/:pathMatch(.*)*",
    redirect: "/error/404",
  },
];

export const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

/**
 * Guardia global de navegación: la puerta de entrada a las rutas privadas.
 * Si no hay sesión, no hay CRUD; si hay sesión y entra al login, lo manda
 * al inicio para no mostrarle un login que no necesita.
 */
router.beforeEach((to) => {
  const auth = useAuthStore();

  // Rutas públicas (login y páginas de error): siempre se permiten.
  if (to.meta.publica) {
    if (to.path === "/login" && auth.autenticado) {
      return { path: "/" };
    }
    return true;
  }

  // Sin token no se entra a ninguna parte del CRUD.
  if (!auth.autenticado) {
    return { path: "/login", query: { redirigido: to.fullPath } };
  }

  // El menú de usuarios es exclusivo del rol ADMIN (control de interfaz).
  if (to.meta.soloAdmin && !auth.esAdmin) {
    return { path: "/" };
  }

  return true;
});

/**
 * Título de la pestaña según la vista: ayuda a identificar la pantalla
 * entre varias pestañas abiertas (usabilidad básica).
 */
router.afterEach((to) => {
  const titulo = to.meta.titulo;
  document.title = titulo ? `${titulo} · Gestión Escolar` : "Gestión Escolar";
});

/**
 * Último recurso: si falla la carga de una vista, en vez de dejar la pantalla
 * en blanco se muestra la página de error 500.
 */
router.onError((error) => {
  const mensaje = String(error?.message || "");
  if (mensaje.includes("dynamically imported module") || mensaje.includes("Failed to fetch")) {
    irAError("500");
  }
});
