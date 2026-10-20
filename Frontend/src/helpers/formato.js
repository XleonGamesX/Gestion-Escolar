/**
 * Utilidades de formato.
 * Estas funciones NO tocan el backend: solo presentan el dato en pantalla.
 */

/**
 * Fecha en formato local corto (1/09/2026) a partir de un ISO de Mongo.
 * @param {string|Date} fecha
 * @returns {string}
 */
export function fechaCorta(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Estado del registro como texto legible.
 * El backend guarda status como NÚMERO (0 activo / 1 inactivo) para que el
 * filtro `?status=0` funcione; aquí se traduce a palabras para el usuario.
 * @param {number} status
 * @returns {{ texto: string, color: string }}
 */
export function estadoDe(status) {
  return Number(status) === 0
    ? { texto: "Activo", color: "positive" }
    : { texto: "Inactivo", color: "negative" };
}
