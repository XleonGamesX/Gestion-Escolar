<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { alertas } from "../helpers/alertas.js";
import { esErrorDeRed, mensajeDeError } from "../helpers/errorHandler.js";
import { authService } from "../services/auth.service.js";
import { useAuthStore } from "../stores/auth.store.js";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const formulario = ref({ email: "", password: "" });
const entrando = ref(false);
const verPassword = ref(false);

// Diálogo de "recuperar contraseña": por ahora SOLO visual.
// No hay endpoint en el backend, así que se explica a quién contactar.
const dialogoRecuperar = ref(false);
const recuperar = ref({ usuario: "", correo: "" });
const enviandoRecuperacion = ref(false);

/**
 * Iniciar sesión.
 * Sin validaciones de HTML ni del navegador: si los datos no sirven, el
 * backend responde 400 con su msg y aquí se muestra con SweetAlert2.
 */
async function entrar() {
  entrando.value = true;
  try {
    const { data } = await authService.login(formulario.value);

    // El token y el usuario quedan en la store persistida (localStorage),
    // por eso la sesión sobrevive a recargar la página.
    auth.iniciarSesion(data);

    // Si vino de una ruta protegida, regresamos justo a donde estaba.
    const redirigido = route.query.redirigido;
    const destino =
      typeof redirigido === "string" && redirigido.startsWith("/")
        ? redirigido
        : "/";

    router.replace(destino);
  } catch (e) {
    if (esErrorDeRed(e)) {
      alertas.error(
        "No hay conexión",
        "No pudimos conectar con el servidor. Revisa que el backend esté encendido e inténtalo de nuevo."
      );
    } else {
      alertas.error("No se pudo iniciar sesión", mensajeDeError(e));
    }
  } finally {
    entrando.value = false;
  }
}

/** Cierra el diálogo de recuperación y confirma el envío. */
async function enviarRecuperacion() {
  enviandoRecuperacion.value = true;
  // Simula el envío: no existe endpoint, solo se confirma visualmente.
  await new Promise((resolver) => setTimeout(resolve, 600));
  enviandoRecuperacion.value = false;
  dialogoRecuperar.value = false;
  recuperar.value = { usuario: "", correo: "" };

  alertas.exito(
    "Solicitud enviada",
    "Si el usuario está registrado recibirás la información de acceso en tu correo. Si no llega en unos minutos, contacta al administrador del colegio."
  );
}
</script>

<template>
  <div class="pantalla-login">
    <!-- Panel izquierdo: el formulario (como en Plataforma Integra) -->
    <section class="panel-formulario">
      <q-card class="tarjeta-login">
        <q-card-section class="text-center q-pb-sm">
          <!-- Ícono genérico: aquí va el escudo del colegio cuando esté disponible -->
          <q-avatar
            class="escudo-login"
            color="primary"
            text-color="white"
            icon="school"
            size="76px"
          />
          <h1 class="titulo-login">Gestión Escolar</h1>
          <div class="subtitulo-pantalla">
            Usuarios, cursos y aprendices en un solo lugar
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-md">
          <q-input
            v-model="formulario.email"
            outlined
            label="Correo electrónico"
            placeholder="Ej. admin@sena.edu.co"
            color="primary"
            autocomplete="off"
            @keyup.enter="entrar"
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-input
            v-model="formulario.password"
            outlined
            :type="verPassword ? 'text' : 'password'"
            label="Contraseña"
            placeholder="Tu contraseña"
            color="primary"
            @keyup.enter="entrar"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="verPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="verPassword = !verPassword"
              />
            </template>
          </q-input>

          <!--
            El botón va envuelto en un <div>: con q-gutter-md cada hijo
            recibe margin-left/top de 12px, pero `full-width` anula esos
            márgenes (!important) y el botón quedaba 12px más ancho que
            los campos. El wrapper recupera el margen y el botón al 100%
            del wrapper = exactamente el mismo ancho que los inputs.
          -->
          <div>
            <q-btn
              unelevated
              color="primary"
              label="Iniciar sesión"
              icon="login"
              class="boton-login full-width"
              :loading="entrando"
              @click="entrar"
            />
          </div>

          <div class="text-center">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              label="¿Olvidaste tu contraseña?"
              class="texto-recuperar"
              @click="dialogoRecuperar = true"
            />
          </div>
        </q-card-section>

        <q-card-section class="text-center text-caption texto-tenue q-pt-none">
          Crea el primer usuario con <b>npm run seed</b> en el backend.
        </q-card-section>

        <q-card-section class="text-center text-caption texto-tenue q-pt-none q-pb-sm">
          Nos acogemos a la Ley 1581 de 2012, sobre la protección de datos.
        </q-card-section>
      </q-card>
    </section>

    <!-- Panel derecho: identidad visual de la plataforma -->
    <aside class="panel-marca">
      <div class="panel-marca__contenido">
        <q-icon name="school" size="64px" />
        <p class="panel-marca__titulo">Plataforma de<br />Gestión Escolar</p>
        <p class="panel-marca__texto">
          Administra usuarios, cursos y aprendices desde un solo lugar,
          con la información siempre a la mano.
        </p>
        <ul class="panel-marca__lista">
          <li><q-icon name="check_circle" /> Usuarios y roles</li>
          <li><q-icon name="check_circle" /> Cursos y duraciones</li>
          <li><q-icon name="check_circle" /> Aprendices inscritos</li>
        </ul>
      </div>
      <div class="panel-marca__pie">
        © {{ new Date().getFullYear() }} Gestión Escolar
      </div>
    </aside>

    <!-- Recuperar contraseña: solo visual, sin endpoint en el backend -->
    <q-dialog v-model="dialogoRecuperar" persistent>
      <q-card class="dialogo-recuperar formulario-dialogo">
        <q-card-section class="row items-center q-gutter-md cabecera-formulario">
          <q-avatar color="primary" text-color="white" icon="lock_reset" size="48px" />
          <div>
            <div class="text-h6">Recuperar contraseña</div>
            <div class="text-caption texto-tenue">
              Te enviaremos la información de acceso a tu correo.
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-md">
          <q-input
            v-model="recuperar.usuario"
            outlined
            label="Usuario"
            placeholder="Tu usuario"
            color="primary"
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="recuperar.correo"
            outlined
            type="email"
            label="Correo electrónico"
            placeholder="Ej. correo@colegio.edu.co"
            color="primary"
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            color="grey-8"
            class="boton-formulario boton-formulario--secundario"
            @click="dialogoRecuperar = false"
          />
          <q-btn
            unelevated
            no-caps
            label="Enviar"
            color="primary"
            icon="send"
            class="boton-formulario"
            :loading="enviandoRecuperacion"
            @click="enviarRecuperacion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
/* Fondo general: panel de formulario neutro, sin degradados que
   compitan con la tarjeta (los acentos viven en el panel de marca) */
.pantalla-login {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
}

.panel-formulario {
  flex: 1 1 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-fondo);
}

/* Tarjeta blanca con las mismas medidas que usa Integra */
.tarjeta-login {
  width: 100%;
  max-width: 390px;
  border-radius: var(--radio);
  padding: 8px 4px;
  box-shadow: var(--sombra-tarjeta);
  border: 1px solid #e4e9ee;
}

.escudo-login {
  box-shadow: 0 0 0 6px rgba(32, 149, 214, 0.14);
}

.titulo-login {
  margin: 16px 0 0;
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-texto);
}

.texto-recuperar {
  font-size: 0.85rem;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dialogo-recuperar {
  min-width: 360px;
  max-width: 95vw;
  border-radius: var(--radio);
}

/* ── Panel de marca ───────────────────────────────────────────── */
.panel-marca {
  flex: 1 1 480px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  padding: 48px;
  color: #fff;
  overflow: hidden;
  /* Degradados con la paleta Integra + acentos verde/amarillo.
     Los acentos viven a la derecha, donde no hay texto encima */
  background:
    radial-gradient(circle at 92% 8%, rgba(26, 168, 94, 0.5), transparent 45%),
    radial-gradient(circle at 88% 88%, rgba(253, 204, 64, 0.35), transparent 42%),
    linear-gradient(135deg, #1577ad 0%, #0f5c85 55%, #0c4e73 100%);
}

.panel-marca::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.32));
  pointer-events: none;
}

.panel-marca__contenido {
  position: relative;
  max-width: 420px;
}

.panel-marca__titulo {
  margin: 20px 0 0;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.15;
}

.panel-marca__texto {
  margin: 16px 0 0;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.92);
}

.panel-marca__lista {
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.panel-marca__lista li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--radio-sm);
  padding: 10px 14px;
  backdrop-filter: blur(2px);
}

.panel-marca__pie {
  position: relative;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* En pantallas pequeñas el panel de marca se retira: el formulario manda */
@media (max-width: 900px) {
  .panel-marca {
    display: none;
  }
}
</style>
