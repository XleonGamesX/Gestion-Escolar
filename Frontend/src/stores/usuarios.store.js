import { defineStore } from "pinia";
import { ref } from "vue";

import { esErrorDeRed, irAError, mensajeDeError } from "../helpers/errorHandler.js";
import { usuariosService } from "../services/usuarios.service.js";

/**
 * Store de USUARIOS (el CRUD interno; la sesión vive en auth.store.js).
 */
export const useUsuariosStore = defineStore("usuarios", () => {
  const usuarios = ref([]);
  const cargando = ref(false);
  const error = ref("");

  async function listar(status) {
    cargando.value = true;
    error.value = "";
    try {
      const { data } = await usuariosService.listar(status);
      usuarios.value = data;
      return data;
    } catch (e) {
      if (esErrorDeRed(e)) {
        irAError("503");
        return [];
      }
      usuarios.value = [];
      error.value = mensajeDeError(e);
      return [];
    } finally {
      cargando.value = false;
    }
  }

  async function crear(datos) {
    const { data } = await usuariosService.crear(datos);
    await listar();
    return data.msg;
  }

  async function actualizar(id, datos) {
    const { data } = await usuariosService.actualizar(id, datos);
    await listar();
    return data.msg;
  }

  async function cambiarEstado(id, activar) {
    const { data } = activar
      ? await usuariosService.activar(id)
      : await usuariosService.desactivar(id);
    await listar();
    return data.msg;
  }

  return { usuarios, cargando, error, listar, crear, actualizar, cambiarEstado };
});
