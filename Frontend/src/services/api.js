import axios from "axios";

import { codigoDeError, irAError } from "../helpers/errorHandler.js";
import { useAuthStore } from "../stores/auth.store.js";

/**
 * Instancia ÚNICA de axios.
 * Si mañana cambia la URL del backend, se cambia en UN solo lugar (el .env),
 * nunca dentro de los componentes.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:4500/api
  headers: { "Content-Type": "application/json" },
});

/**
 * Request: inyecta el token en la cabecera x-token que pide el backend.
 * Como aquí NO se llama a useAuthStore() en la definición del interceptor
 * (solo dentro del callback), no se crea ningún ciclo con las stores.
 */
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers["x-token"] = auth.token;
  }
  return config;
});

/**
 * Response: aquí se resuelven TODOS los errores que no son de validación.
 *
 * - 401  -> el token ya no sirve: se cierra la sesión y se va a la página 401.
 * - 403  -> sin permisos: página 403.
 * - 500  -> falló el servidor: página 500 con el msg que venga del backend.
 * - 400  -> NO se toca: son errores de datos que el formulario muestra en una
 *           alerta de SweetAlert2, junto al campo que falló.
 */
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const codigo = codigoDeError(error);

    if (codigo === "401") {
      useAuthStore().cerrarSesion();
      irAError("401");
    } else if (codigo === "403") {
      irAError("403");
    } else if (codigo === "500") {
      irAError("500");
    }

    // Se propaga el error original: quien hizo la petición decide qué hacer
    // (mostrar la lista de validaciones, un toast, etc.).
    return Promise.reject(error);
  }
);

export default api;
