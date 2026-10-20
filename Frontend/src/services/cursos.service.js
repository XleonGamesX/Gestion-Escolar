import api from "./api.js";

/**
 * Servicio de CURSOS — espejo de la tabla de endpoints del backend.
 */
export const cursosService = {
  listar: (status) => api.get("/cursos", { params: { status } }),
  obtener: (id) => api.get(`/cursos/${id}`),
  crear: (data) => api.post("/cursos/register", data),
  actualizar: (id, data) => api.put(`/cursos/update/${id}`, data),
  activar: (id) => api.put(`/cursos/active/${id}`),
  desactivar: (id) => api.put(`/cursos/inactive/${id}`),
};
