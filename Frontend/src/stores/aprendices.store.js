import { defineStore } from "pinia";
import { ref } from "vue";

import { esErrorDeRed, irAError, mensajeDeError } from "../helpers/errorHandler.js";
import { aprendicesService } from "../services/aprendices.service.js";

/**
 * Store de APRENDICES.
 * Mismo patrón que cursos.store.js: estado de la lista + acciones CRUD.
 */
export const useAprendicesStore = defineStore("aprendices", () => {
  const aprendices = ref([]);
  const cargando = ref(false);
  const error = ref("");

  async function listar(status) {
    cargando.value = true;
    error.value = "";
    try {
      const { data } = await aprendicesService.listar(status);
      aprendices.value = data;
      return data;
    } catch (e) {
      if (esErrorDeRed(e)) {
        irAError("503");
        return [];
      }
      aprendices.value = [];
      error.value = mensajeDeError(e);
      return [];
    } finally {
      cargando.value = false;
    }
  }

  async function crear(datos) {
    const { data } = await aprendicesService.crear(datos);
    await listar();
    return data.msg;
  }

  async function actualizar(id, datos) {
    const { data } = await aprendicesService.actualizar(id, datos);
    await listar();
    return data.msg;
  }

  async function cambiarEstado(id, activar) {
    const { data } = activar
      ? await aprendicesService.activar(id)
      : await aprendicesService.desactivar(id);
    await listar();
    return data.msg;
  }

  return {
    aprendices,
    cargando,
    error,
    listar,
    crear,
    actualizar,
    cambiarEstado,
  };
});
