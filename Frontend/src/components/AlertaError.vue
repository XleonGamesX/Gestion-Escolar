<script setup>
/**
 * Banner de error reutilizable para las listas.
 * Se muestra cuando el backend respondió con un fallo que no fue de red
 * (la red la resuelve la página 503) y ofrece reintentar, para que el
 * usuario nunca quede mirando una tabla vacía sin explicación.
 */
defineProps({
  mensaje: { type: String, default: "" },
});

defineEmits(["reintentar"]);
</script>

<template>
  <q-banner
    v-if="mensaje"
    class="bg-red-1 q-mb-md"
    rounded
    inline-actions
    dense
  >
    <template #avatar>
      <q-icon name="error_outline" color="negative" />
    </template>
    {{ mensaje }}
    <template #action>
      <q-btn
        no-caps
        color="negative"
        icon="refresh"
        label="Reintentar"
        class="boton-formulario"
        @click="$emit('reintentar')"
      />
    </template>
  </q-banner>
</template>
