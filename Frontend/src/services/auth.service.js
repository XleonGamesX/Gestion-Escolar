import api from "./api.js";

/**
 * Servicio de AUTENTICACIÓN.
 * Espejo exacto de la fila `POST /api/usuarios/login` de la tabla de endpoints
 * del README del backend.
 */
export const authService = {
  /** @returns {Promise<{usuario: Object, token: string}>} */
  login: (datos) => api.post("/usuarios/login", datos),
};
