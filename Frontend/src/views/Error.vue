<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import ErrorCard from "../components/ErrorCard.vue";
import { PAGINAS_DE_ERROR } from "../helpers/errorHandler.js";

const route = useRoute();

/**
 * Página de error del SPA.
 * El código llega por la URL (/error/404, /error/501...). Si alguien escribe
 * un código que no existe en el catálogo, mostramos el 404: nunca una pantalla
 * en blanco.
 */
const info = computed(() => {
  const codigo = String(route.params.codigo);
  return PAGINAS_DE_ERROR[codigo] ?? PAGINAS_DE_ERROR["404"];
});
</script>

<template>
  <ErrorCard
    :codigo="info.codigo"
    :titulo="info.titulo"
    :mensaje="info.mensaje"
    :accion="info.accion"
    :texto-accion="info.textoAccion"
  />
</template>
