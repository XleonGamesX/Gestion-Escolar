import api from "./api.js";

/**
 * Servicio de USUARIOS — espejo de la tabla de endpoints del backend.
 * Los componentes NUNCA llaman a axios directamente: llaman aquí.
 */
export const usuariosService = {
  listar: (status) => api.get("/usuarios", { params: { status } }),
  obtener: (id) => api.get(`/usuarios/${id}`),
  crear: (data) => api.post("/usuarios/register", data),
  actualizar: (id, data) => api.put(`/usuarios/update/${id}`, data),
  activar: (id) => api.put(`/usuarios/active/${id}`),
  desactivar: (id) => api.put(`/usuarios/inactive/${id}`),
};
