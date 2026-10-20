import { defineStore } from "pinia";
import { computed, ref } from "vue";

/**
 * Store de autenticación: guarda el token y el usuario logueado.
 *
 * Es la ÚNICA store con `persist: true`, así que pinia-plugin-persistedstate
 * la escribe en localStorage. Al recargar la página el usuario sigue dentro,
 * y al cerrar sesión basta con vaciar el estado: el plugin limpia el storage.
 *
 * Convención: el nombre de la función que crea la store es `useXxxStore`.
 */
export const useAuthStore = defineStore(
  "auth",
  () => {
    // Estado reactivo (en Options API sería state)
    const token = ref("");
    const usuario = ref(null);

    // Getters (en Options API serían getters)
    const autenticado = computed(
      () => token.value !== "" && usuario.value !== null
    );
    const esAdmin = computed(() => usuario.value?.rol === "ADMIN");
    const nombreCompleto = computed(() => usuario.value?.nombre ?? "");

    // Acciones (en Options API serían methods)
    function iniciarSesion(datos) {
      token.value = datos.token;
      usuario.value = datos.usuario;
    }

    function cerrarSesion() {
      token.value = "";
      usuario.value = null;
    }

    return {
      token,
      usuario,
      autenticado,
      esAdmin,
      nombreCompleto,
      iniciarSesion,
      cerrarSesion,
    };
  },
  {
    // Todo el estado de esta store se guarda en localStorage
    persist: true,
  }
);
