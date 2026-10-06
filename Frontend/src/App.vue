<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { alertas } from "./helpers/alertas.js";
import { useAuthStore } from "./stores/auth.store.js";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const leftDrawerOpen = ref(false);

/**
 * El login y las páginas de error se muestran a pantalla completa:
 * sin header, sin menú y sin footer, para que el usuario mire SOLO lo
 * importante (la sesión o el mensaje del error).
 */
const pantallaCompleta = computed(() => route.meta.pantallaCompleta === true);

/**
 * Menú lateral. `soloAdmin` oculta la opción a los usuarios con rol USER
 * (el backend igual protege los datos con su token).
 */
const menu = [
  { ruta: "/", etiqueta: "Inicio", icono: "home" },
  { ruta: "/usuarios", etiqueta: "Usuarios", icono: "group", soloAdmin: true },
  { ruta: "/cursos", etiqueta: "Cursos", icono: "school" },
  { ruta: "/aprendices", etiqueta: "Aprendices", icono: "badge" },
];

const menuVisible = computed(() =>
  menu.filter((item) => !item.soloAdmin || auth.esAdmin)
);

function alternarDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

/**
 * Cerrar sesión: siempre con confirmación (SweetAlert2), nunca con
 * window.confirm. Al confirmar se vacía la store y el plugin de persistencia
 * limpia el localStorage automáticamente.
 */
async function cerrarSesion() {
  const confirmado = await alertas.confirmar({
    titulo: "¿Cerrar sesión?",
    mensaje: "Tendrás que iniciar sesión de nuevo para volver a entrar.",
    textoConfirmar: "Cerrar sesión",
  });

  if (!confirmado) return;

  auth.cerrarSesion();
  router.replace("/login");
}

// Al cambiar de pantalla el menú se cierra (en móvil tapa el contenido).
watch(
  () => route.fullPath,
  () => {
    if (!pantallaCompleta.value) leftDrawerOpen.value = false;
  }
);

const anio = new Date().getFullYear();
</script>

<template>
  <!-- Pantalla completa: login y páginas de error -->
  <q-layout v-if="pantallaCompleta" view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <!-- Aplicación autenticada -->
  <q-layout v-else view="hHh lpR fFf">
    <q-header elevated class="cabecera-app text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir o cerrar el menú"
          class="boton-menu"
          @click="alternarDrawer"
        />

        <q-toolbar-title class="text-weight-bold">
          <q-icon name="school" size="sm" class="q-mr-sm" />
          Gestión Escolar
        </q-toolbar-title>

        <div class="row items-center no-wrap q-gutter-sm">
          <q-chip
            v-if="auth.usuario"
            dense
            color="white"
            text-color="primary"
            icon="account_circle"
            class="gt-xs"
          >
            {{ auth.nombreCompleto }} · {{ auth.usuario.rol }}
          </q-chip>

          <q-btn
            flat
            dense
            no-caps
            icon="logout"
            label="Salir"
            aria-label="Cerrar sesión"
            class="boton-salir"
            @click="cerrarSesion"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" bordered class="menu-lateral">
      <q-list padding>
        <q-item-label header class="text-weight-bold texto-tenue">
          <q-icon name="dashboard" size="sm" class="q-mr-xs" />
          Menú principal
        </q-item-label>

        <q-item
          v-for="item in menuVisible"
          :key="item.ruta"
          :to="item.ruta"
          exact
          clickable
          v-ripple
          class="item-menu"
          active-class="item-menu--activo text-white"
        >
          <q-item-section avatar>
            <q-icon :name="item.icono" />
          </q-item-section>
          <q-item-section class="text-weight-medium">{{
            item.etiqueta
          }}</q-item-section>
          <q-item-section avatar>
            <q-icon name="chevron_right" size="sm" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="pie-app">
      <q-toolbar>
        <q-toolbar-title class="text-caption">
          © {{ anio }} Gestión Escolar · Vue 3 +
          Quasar
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<style scoped>
/* Cabecera con degradado de la paleta Integra (en vez de azul plano) */
.cabecera-app {
  background: linear-gradient(90deg, #1577ad 0%, #0f5c85 100%);
}

/* Botón de menú: mismo tratamiento que "Salir" para que los dos
   controles de la barra se lean con el mismo peso */
.boton-menu {
  border: 1px solid rgba(255, 255, 255, 0.55);
}

.boton-menu:hover {
  background-color: rgba(255, 255, 255, 0.16);
}

/* "Salir" siempre visible: borde propio para distinguirlo del fondo */
.boton-salir {
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: var(--radio-sm);
  padding: 0 12px;
  min-height: 34px;
  font-weight: 500;
}

.boton-salir:hover {
  background-color: rgba(255, 255, 255, 0.16);
}

/* Pie claro en lugar del gris oscuro, que competía con el contenido */
.pie-app {
  background: #ffffff;
  color: var(--color-tenue);
  border-top: 1px solid var(--color-borde);
}
</style>
