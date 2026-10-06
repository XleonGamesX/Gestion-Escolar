<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import { useAprendicesStore } from "../stores/aprendices.store.js";
import { useAuthStore } from "../stores/auth.store.js";
import { useCursosStore } from "../stores/cursos.store.js";
import { useUsuariosStore } from "../stores/usuarios.store.js";

const router = useRouter();
const auth = useAuthStore();
const usuariosStore = useUsuariosStore();
const cursosStore = useCursosStore();
const aprendicesStore = useAprendicesStore();

const cargando = computed(
  () => usuariosStore.cargando || cursosStore.cargando || aprendicesStore.cargando
);

/**
 * Tarjetas del dashboard: una por recurso.
 * Cada una es clicable EN CUALQUIER PUNTO y además lleva un botón con
 * texto ("Ver usuarios →"), para que nunca haya que adivinar dónde
 * presionar.
 */
const tarjetas = computed(() =>
  [
    {
      titulo: "Usuarios",
      valor: usuariosStore.usuarios.length,
      icono: "group",
      color: "primary",
      textoIcono: "white",
      ruta: "/usuarios",
      detalle: "Cuentas con acceso",
      accion: "Ver usuarios",
      soloAdmin: true,
    },
    {
      titulo: "Cursos",
      valor: cursosStore.cursos.length,
      icono: "school",
      color: "secondary",
      textoIcono: "white",
      ruta: "/cursos",
      detalle: "Programas formativos",
      accion: "Ver cursos",
      soloAdmin: false,
    },
    {
      titulo: "Aprendices",
      valor: aprendicesStore.aprendices.length,
      icono: "badge",
      color: "accent",
      textoIcono: "dark",
      ruta: "/aprendices",
      detalle: "Inscritos en un curso",
      accion: "Ver aprendices",
      soloAdmin: false,
    },
  ].filter((tarjeta) => !tarjeta.soloAdmin || auth.esAdmin)
);

const fechaHoy = new Date().toLocaleDateString("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function ir(ruta) {
  router.push(ruta);
}

onMounted(async () => {
  // Las tres cargas son independientes: se piden en paralelo.
  const peticiones = [cursosStore.listar(), aprendicesStore.listar()];
  if (auth.esAdmin) peticiones.push(usuariosStore.listar());
  await Promise.all(peticiones);
});
</script>

<template>
  <div class="q-pa-md">
    <!-- Saludo: da contexto a la persona que entra -->
    <div class="q-mb-lg">
      <h1 class="titulo-pantalla">
        Hola, {{ auth.nombreCompleto || "usuario" }}
      </h1>
      <p class="subtitulo-pantalla">Resumen del día · {{ fechaHoy }}</p>
    </div>

    <div class="row q-col-gutter-md">
      <div
        v-for="tarjeta in tarjetas"
        :key="tarjeta.titulo"
        class="col-12 col-sm-6 col-lg-4"
      >
        <q-card
          class="tarjeta-resumen tarjeta-accion"
          :class="`filete--${tarjeta.color}`"
          role="button"
          tabindex="0"
          :aria-label="`Ir a ${tarjeta.titulo}`"
          @click="ir(tarjeta.ruta)"
          @keyup.enter="ir(tarjeta.ruta)"
        >
          <q-card-section class="row items-center no-wrap q-gutter-md">
            <q-avatar
              :color="tarjeta.color"
              :text-color="tarjeta.textoIcono"
              :icon="tarjeta.icono"
              size="56px"
            />
            <div class="column">
              <span class="text-h4 text-weight-bold">
                <q-skeleton v-if="cargando" type="text" width="60px" />
                <template v-else>{{ tarjeta.valor }}</template>
              </span>
              <span class="text-subtitle2 text-weight-medium">{{
                tarjeta.titulo
              }}</span>
              <span class="text-caption texto-tenue">{{ tarjeta.detalle }}</span>
            </div>
          </q-card-section>

          <q-separator spaced />

          <!-- Botón con TEXTO: es la señal inequívoca de que hay que pulsar -->
          <q-card-section class="q-py-sm">
            <q-btn
              outline
              no-caps
              color="primary"
              :label="tarjeta.accion"
              icon-right="arrow_forward"
              class="full-width boton-ver"
              @click.stop="ir(tarjeta.ruta)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Accesos rápidos: atajos secundarios, con icono de navegación
         (antes usaban "add", que sugería crear un registro) -->
    <q-card class="tarjeta-resumen q-mt-lg">
      <q-card-section>
        <div class="titulo-bloque q-mb-xs">Accesos rápidos</div>
        <div class="subtitulo-pantalla q-mb-md">
          Salta directamente a la sección que necesitas.
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            outline
            color="primary"
            no-caps
            icon="school"
            label="Ir a Cursos"
            icon-right="arrow_forward"
            class="boton-acceso"
            @click="ir('/cursos')"
          />
          <q-btn
            outline
            color="primary"
            no-caps
            icon="badge"
            label="Ir a Aprendices"
            icon-right="arrow_forward"
            class="boton-acceso"
            @click="ir('/aprendices')"
          />
          <q-btn
            v-if="auth.esAdmin"
            outline
            color="primary"
            no-caps
            icon="group"
            label="Ir a Usuarios"
            icon-right="arrow_forward"
            class="boton-acceso"
            @click="ir('/usuarios')"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
/* Filete de color en la tarjeta según el recurso */
.filete--primary {
  border-top: 4px solid var(--color-primario-claro);
}
.filete--secondary {
  border-top: 4px solid var(--color-secundario);
}
.filete--accent {
  border-top: 4px solid var(--color-acento);
}

.boton-ver {
  min-height: var(--zona-tactil);
  border-radius: var(--radio-sm);
  font-weight: 500;
}

.boton-acceso {
  min-height: var(--zona-tactil);
  border-radius: var(--radio-sm);
}
</style>
