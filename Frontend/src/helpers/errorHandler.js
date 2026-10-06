/**
 * Manejo centralizado de errores.
 *
 * Aquí se decide, en UN solo lugar, qué página de error le toca a cada
 * fallo. Las vistas y el interceptor de axios llaman estas funciones en vez
 * de repetir la misma lógica por todas partes (DRY).
 */

/**
 * Catálogo de páginas de error.
 * Mismo criterio que la pestaña de errores de GitHub: código grande,
 * título corto y una explicación en lenguaje humano. Estos textos se usan
 * dentro del SPA (views/Error.vue); las páginas estáticas de public/
 * replican el mismo diseño para cuando Vue ni siquiera llega a arrancar.
 */
export const PAGINAS_DE_ERROR = {
  "401": {
    codigo: "401",
    titulo: "Tu sesión ya no es válida",
    mensaje:
      "Cerraste sesión, tu sesión expiró o el token ya no sirve. Vuelve a entrar para continuar donde estabas.",
    accion: "login",
    textoAccion: "Iniciar sesión",
  },
  "403": {
    codigo: "403",
    titulo: "No tienes permiso para ver esto",
    mensaje:
      "Tu usuario no tiene los permisos necesarios. Si crees que es un error, pide acceso a un administrador.",
    accion: "inicio",
    textoAccion: "Volver al inicio",
  },
  "404": {
    codigo: "404",
    titulo: "No encontramos esa página",
    mensaje:
      "La dirección que escribiste no existe o cambió de lugar. Revisa la URL o vuelve al inicio.",
    accion: "inicio",
    textoAccion: "Volver al inicio",
  },
  "500": {
    codigo: "500",
    titulo: "Algo falló de nuestro lado",
    mensaje:
      "Ocurrió un error inesperado en el servidor. No es culpa de lo que hiciste; intenta de nuevo en unos minutos.",
    accion: "reintentar",
    textoAccion: "Intentar de nuevo",
  },
  "503": {
    codigo: "503",
    titulo: "No pudimos conectar con el servidor",
    mensaje:
      "La aplicación no responde en este momento. Revisa que el backend esté encendido y vuelve a intentar.",
    accion: "reintentar",
    textoAccion: "Intentar de nuevo",
  },
};

/**
 * ¿Es un error de red? (el backend apagado, sin internet, URL mal, CORS...)
 * axios responde con error.response vacío cuando la petición ni siquiera
 * llegó a recibir una respuesta HTTP.
 * @param {Error} e
 * @returns {boolean}
 */
export function esErrorDeRed(e) {
  return Boolean(e) && !e.response;
}

/**
 * Traduce una respuesta HTTP al código de página que le corresponde.
 * Los 400 (validaciones) devuelven null: esos NO son página de error,
 * se muestran junto al formulario.
 * @param {Error} e
 * @returns {string|null} "401" | "403" | "404" | "500" | null
 */
export function codigoDeError(e) {
  if (esErrorDeRed(e)) return "503";

  const status = e?.response?.status;
  if (!status) return null;
  if (status === 401) return "401";
  if (status === 403) return "403";
  if (status === 404) return "404";
  if (status >= 500) return "500";
  return null;
}

/**
 * Navega a la página de error indicada.
 * Se usa location.hash a propósito: el router trabaja con historial tipo hash
 * (`/#/cursos`), así que escribir el hash dispara la navegación sin tener que
 * importar el router aquí (lo que crearía un ciclo de imports).
 * @param {string} codigo
 */
export function irAError(codigo) {
  const destino = `#/error/${codigo}`;
  if (window.location.hash !== destino) {
    window.location.hash = destino;
  }
}

/**
 * Extrae el mensaje más útil que envió el backend.
 * El backend responde `{ msg }` o `{ msg, errors: [...] }`; si no hay
 * respuesta, devolvemos un texto genérico entendible.
 * @param {Error} e
 * @returns {string}
 */
export function mensajeDeError(e) {
  if (esErrorDeRed(e)) {
    return "No pudimos conectar con el servidor";
  }

  const data = e?.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join("\n");
  }

  return data?.msg || "No fue posible terminar la operacion";
}
