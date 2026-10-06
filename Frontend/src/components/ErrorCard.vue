<script setup>
import { useRouter } from "vue-router";

/**
 * Tarjeta de error a pantalla completa.
 * Mismo criterio visual que la pestaña de errores de GitHub: el código manda,
 * luego una línea, luego el título y una explicación corta y humana.
 * Lo usan tanto las vistas del SPA como el catálogo PAGINAS_DE_ERROR.
 */
const props = defineProps({
  codigo: { type: String, required: true },
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  /** "inicio" | "login" | "reintentar" */
  accion: { type: String, default: "inicio" },
  textoAccion: { type: String, default: "Volver al inicio" },
});

const router = useRouter();

function ejecutarAccion() {
  if (props.accion === "login") {
    router.replace("/login");
  } else if (props.accion === "reintentar") {
    // Recarga completa: útil cuando el problema era el backend apagado.
    window.location.reload();
  } else {
    router.replace("/");
  }
}
</script>

<template>
  <div class="pagina-error">
    <div class="marca">
      <q-icon name="school" size="20px" class="q-mr-xs" />
      Gestión Escolar
    </div>

    <div class="codigo">{{ codigo }}</div>
    <div class="linea"></div>

    <h1 class="titulo">{{ titulo }}</h1>
    <p class="mensaje">{{ mensaje }}</p>

    <div class="acciones">
      <q-btn
        unelevated
        color="primary"
        no-caps
        class="boton-principal"
        :label="textoAccion"
        @click="ejecutarAccion"
      />
      <q-btn
        v-if="accion !== 'inicio'"
        flat
        color="grey-8"
        no-caps
        label="Volver al inicio"
        class="boton-formulario boton-formulario--secundario"
        @click="router.replace('/')"
      />
    </div>
  </div>
</template>

<style scoped>
.pagina-error {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  background-color: var(--color-fondo);
}

.marca {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-tenue);
  margin-bottom: 40px;
}

/* El código es el protagonista de la pantalla */
.codigo {
  font-size: clamp(88px, 22vw, 200px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.06em;
  color: var(--color-texto);
}

.linea {
  width: min(420px, 80vw);
  height: 1px;
  background-color: var(--color-borde);
  margin: 40px 0;
}

.titulo {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  margin: 0;
  color: var(--color-texto);
}

.mensaje {
  max-width: 540px;
  margin: 16px 0 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-tenue);
}

.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 36px;
}

.boton-principal {
  border-radius: var(--radio);
  padding-inline: 24px;
  min-height: var(--zona-tactil);
}
</style>
