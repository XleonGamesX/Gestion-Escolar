import Swal from "sweetalert2";

import "sweetalert2/dist/sweetalert2.min.css";

/**
 * Alertas con SweetAlert2.
 *
 * REGLA DEL PROYECTO: acá se resuelve TODA la mensajeería visual.
 * Nunca se usa window.alert / window.confirm / window.prompt ni los
 * mensajes nativos del navegador: el usuario siempre ve este componente,
 * que además sigue la identidad visual de la aplicación.
 *
 * FORMATO (igual en toda la aplicación): nada de cuadros grandes en el
 * centro de la pantalla. Cada alerta es un aviso COMPACTO pegado abajo a
 * la derecha, con UN SOLO COLOR DE FONDO plano y cierre automático:
 *
 *   · azul  → confirmaciones y avisos informativos
 *   · verde → todo salió bien
 *   · rojo  → hubo un error (además tiene ✕ para cerrarlo antes)
 *
 * El aviso no tapa la pantalla ni bloquea los clics: mientras se lee se
 * puede seguir usando la tabla (el contenedor del toast es transparente
 * y no captura los eventos del mouse).
 */

// Colores alineados con quasar-variables.sass ($primary: #1577AD,
// $positive: #158047, $negative: #CF2F34): paleta Plataforma Integra
// oscurecida para cumplir contraste AA con texto blanco.
const COLOR_PRIMARIO = "#1577AD";
const COLOR_EXITO = "#158047";
const COLOR_ERROR = "#CF2F34";
const TEXTO_CLARO = "#ffffff";

const base = {
  confirmButtonColor: COLOR_PRIMARIO,
  buttonsStyling: true,
  // No se toca showClass/hideClass: así se conservan las animaciones por
  // defecto que trae SweetAlert2 (si se sobreescriben con clases ajenas,
  // la alerta puede quedarse pegada en pantalla).
};

// Forma común de TODAS las notificaciones: aviso chico abajo a la derecha.
const baseAviso = {
  toast: true,
  position: "bottom-end", // abajo, alineado a la derecha
  width: 340, // ancho reducido (el cuadro centrado media 512px)
};

/**
 * Construye una notificación compacta de un solo color.
 * @param {{
 *   titulo: string,
 *   mensaje?: string,
 *   icon: "success" | "error" | "info" | "question",
 *   color: string,
 *   clase: string,
 *   duracion?: number,
 *   cerrar?: boolean,
 * }} opciones
 */
function notificacion({
  titulo,
  mensaje = "",
  icon,
  color,
  clase,
  duracion,
  cerrar = false,
}) {
  const opciones = {
    ...base,
    ...baseAviso,
    icon,
    title: titulo,
    background: color,
    color: TEXTO_CLARO,
    customClass: { popup: `alerta-toast ${clase}` },
    showCloseButton: cerrar,
    // Sin botón "Aceptar": el aviso se cierra solo y no interrumpe.
    showConfirmButton: false,
  };

  // Solo el mensaje largo va como párrafo; si está vacío no se renderiza
  // (si no, queda un hueco en blanco debajo del título).
  if (mensaje) opciones.text = mensaje;

  if (duracion) {
    opciones.timer = duracion;
    opciones.timerProgressBar = true;
  }

  return Swal.fire(opciones);
}

export const alertas = {
  /**
   * Confirmación con botón de cancelar. Devuelve true/false.
   * Se usa para cerrar sesión y para activar/desactivar registros.
   * Sale como aviso compacto abajo a la derecha, nunca como cuadro centrado.
   * @returns {Promise<boolean>}
   */
  async confirmar({ titulo, mensaje, textoConfirmar = "Aceptar" }) {
    const { isConfirmed } = await Swal.fire({
      ...base,
      ...baseAviso,
      icon: "question",
      title: titulo,
      text: mensaje,
      background: COLOR_PRIMARIO,
      color: TEXTO_CLARO,
      customClass: { popup: "alerta-toast alerta-toast--confirmar" },
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: "Cancelar",
      // Botón primario en blanco sobre el fondo azul.
      confirmButtonColor: TEXTO_CLARO,
      reverseButtons: true,
    });

    return isConfirmed;
  },

  /** Mensaje de éxito tras crear/actualizar/cambiar estado. */
  exito(titulo, mensaje = "") {
    return notificacion({
      titulo,
      mensaje,
      icon: "success",
      color: COLOR_EXITO,
      clase: "alerta-toast--exito",
      duracion: 4000,
    });
  },

  /** Mensaje de error (respuesta 400 del backend, conexión, etc.). */
  error(titulo, mensaje = "") {
    return notificacion({
      titulo,
      mensaje,
      icon: "error",
      color: COLOR_ERROR,
      clase: "alerta-toast--error",
      // Más tiempo para leer el detalle del error + botón ✕.
      duracion: 6000,
      cerrar: true,
    });
  },

  /** Aviso informativo breve: no interrumpe, se cierra solo. */
  aviso(mensaje) {
    return notificacion({
      titulo: mensaje,
      icon: "info",
      color: COLOR_PRIMARIO,
      clase: "alerta-toast--aviso",
      duracion: 3500,
    });
  },
};
