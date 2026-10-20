import { defineStore } from "pinia";
import { ref } from "vue";

import { esErrorDeRed, irAError, mensajeDeError } from "../helpers/errorHandler.js";
import { cursosService } from "../services/cursos.service.js";

/**
 * Store de CURSOS.
 *
 * Responsabilidad: el estado de la lista (datos, cargando, error) y las
 * operaciones CRUD. Las vistas SOLO pintan y llaman estas acciones; así si
 * mañana cambia una ruta del backend se toca el servicio y nada más.
 */
export const useCursosStore = defineStore("cursos", () => {
  const cursos = ref([]);
  const cargando = ref(false);
  const error = ref("");

  /**
   * Carga la lista desde el backend.
   * @param {number} [status] - 0 activos, 1 inactivos; sin valor = todos.
   * @returns {Promise<Array>} la lista cargada (vacía si falló).
   */
  async function listar(status) {
    cargando.value = true;
    error.value = "";
    try {
      const { data } = await cursosService.listar(status);
      cursos.value = data;
      return data;
    } catch (e) {
      // El backend apagado / sin conexión => página 503 de pantalla completa.
      if (esErrorDeRed(e)) {
        irAError("503");
        return [];
      }
      // 401/403/500 ya los resuelve el interceptor de api.js; cualquier otro
      // fallo se explica en el banner de la tabla.
      cursos.value = [];
      error.value = mensajeDeError(e);
      return [];
    } finally {
      cargando.value = false;
    }
  }

  /** Crea un curso y recarga la lista. Devuelve el mensaje del backend. */
  async function crear(datos) {
    const { data } = await cursosService.crear(datos);
    await listar();
    return data.msg;
  }

  /** Actualiza un curso y recarga la lista. */
  async function actualizar(id, datos) {
    const { data } = await cursosService.actualizar(id, datos);
    await listar();
    return data.msg;
  }

  /** Cambia el estado del curso (0 activo / 1 inactivo) y recarga. */
  async function cambiarEstado(id, activar) {
    const { data } = activar
      ? await cursosService.activar(id)
      : await cursosService.desactivar(id);
    await listar();
    return data.msg;
  }

  return { cursos, cargando, error, listar, crear, actualizar, cambiarEstado };
});
