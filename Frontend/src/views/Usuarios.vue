<script setup>
import { computed, onMounted, ref } from "vue";

import AlertaError from "../components/AlertaError.vue";
import FormUsuario from "../components/FormUsuario.vue";
import { alertas } from "../helpers/alertas.js";
import { mensajeDeError } from "../helpers/errorHandler.js";
import { estadoDe, fechaCorta } from "../helpers/formato.js";
import { useAuthStore } from "../stores/auth.store.js";
import { useUsuariosStore } from "../stores/usuarios.store.js";

const usuariosStore = useUsuariosStore();
const auth = useAuthStore();

// ── Estado de la pantalla ──────────────────────────────────────────
const buscar = ref("");
const filtro = ref("todos");
const dialogoAbierto = ref(false);
const usuarioEnEdicion = ref(null);

const opcionesFiltro = [
  { label: "Todos", value: "todos", icon: "list_alt" },
  { label: "Activos", value: "activos", icon: "check_circle" },
  { label: "Inactivos", value: "inactivos", icon: "block" },
];

const columnas = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "email", label: "Correo", field: "email", align: "left", sortable: true },
  { name: "rol", label: "Rol", field: "rol", align: "center", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "center", sortable: true },
  {
    name: "createdAt",
    label: "Creado",
    field: "createdAt",
    align: "center",
    sortable: true,
    format: (valor) => fechaCorta(valor),
  },
  { name: "acciones", label: "Acciones", field: "_id", align: "right" },
];

const usuariosFiltrados = computed(() => {
  let lista = usuariosStore.usuarios;

  if (filtro.value === "activos") {
    lista = lista.filter((u) => Number(u.status) === 0);
  } else if (filtro.value === "inactivos") {
    lista = lista.filter((u) => Number(u.status) !== 0);
  }

  const texto = buscar.value.trim().toLowerCase();
  if (texto) {
    lista = lista.filter((u) =>
      `${u.nombre} ${u.email} ${u.rol}`.toLowerCase().includes(texto)
    );
  }

  return lista;
});

/** true si la fila es la cuenta con la que se inició sesión. */
function esMiCuenta(fila) {
  return fila._id === auth.usuario?._id;
}

// ── Acciones ───────────────────────────────────────────────────────
function cargar() {
  return usuariosStore.listar();
}

function nuevo() {
  usuarioEnEdicion.value = null;
  dialogoAbierto.value = true;
}

function editar(usuario) {
  usuarioEnEdicion.value = usuario;
  dialogoAbierto.value = true;
}

async function cambiarEstado(usuario) {
  const activo = Number(usuario.status) === 0;

  const confirmado = await alertas.confirmar({
    titulo: activo ? "¿Desactivar el usuario?" : "¿Activar el usuario?",
    mensaje: activo
      ? `«${usuario.nombre}» dejará de poder iniciar sesión. El registro no se borra.`
      : `«${usuario.nombre}» podrá volver a iniciar sesión.`,
    textoConfirmar: activo ? "Desactivar" : "Activar",
  });

  if (!confirmado) return;

  try {
    const mensaje = await usuariosStore.cambiarEstado(usuario._id, !activo);
    alertas.exito(mensaje);
  } catch (e) {
    alertas.error("No se pudo cambiar el estado", mensajeDeError(e));
  }
}

onMounted(cargar);
</script>

<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <h1 class="titulo-pantalla">Usuarios</h1>
      <p class="subtitulo-pantalla">
        Cuentas con acceso a la aplicación. La contraseña nunca se muestra.
      </p>
    </div>

    <AlertaError :mensaje="usuariosStore.error" @reintentar="cargar" />

    <q-card class="tarjeta-resumen">
      <q-table
        :rows="usuariosFiltrados"
        :columns="columnas"
        row-key="_id"
        :loading="usuariosStore.cargando"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20]"
        no-data-label="No hay usuarios que coincidan con el filtro"
      >
        <template #top>
          <div class="barra-tabla">
            <div class="barra-tabla__titulo">
              <div class="titulo-bloque">Listado de usuarios</div>
              <div class="text-caption texto-tenue">
                {{ usuariosFiltrados.length }} de
                {{ usuariosStore.usuarios.length }} registros
              </div>
            </div>

            <q-input
              v-model="buscar"
              outlined
              dense
              clearable
              placeholder="Buscar por nombre, correo o rol"
              class="barra-tabla__buscar"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Filtro segmentado: la opción activa se pinta de azul y
                 lleva icono, para saber qué hace cada botón de un vistazo -->
            <q-btn-toggle
              v-model="filtro"
              no-caps
              unelevated
              dense
              toggle-color="primary"
              toggle-text-color="white"
              :options="opcionesFiltro"
              class="segmentado"
            />

            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="person_add"
              label="Nuevo usuario"
              class="boton-principal-tabla"
              @click="nuevo"
            />
          </div>
        </template>

        <template #no-data>
          <div class="row items-center justify-center q-pa-lg text-grey-7">
            <q-icon name="search_off" size="28px" class="q-mr-sm" />
            <span>
              {{
                usuariosStore.error
                  ? "No se pudo cargar la información"
                  : "Todavía no hay usuarios registrados."
              }}
            </span>
          </div>
        </template>

        <!-- Fila propia destacada: es la cuenta con la que se entró -->
        <template #body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-avatar
                :color="esMiCuenta(props.row) ? 'primary' : 'grey-4'"
                :text-color="esMiCuenta(props.row) ? 'white' : 'grey-8'"
                icon="person"
                size="32px"
              />
              <span :class="{ 'text-weight-medium': esMiCuenta(props.row) }">
                {{ props.row.nombre }}
              </span>
              <q-badge v-if="esMiCuenta(props.row)" color="primary" label="Tú" />
            </div>
          </q-td>
        </template>

        <template #body-cell-rol="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.rol === 'ADMIN' ? 'purple' : 'blue-grey-4'"
              :text-color="props.row.rol === 'ADMIN' ? 'white' : 'grey-9'"
              :label="props.row.rol"
            />
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="estadoDe(props.row.status).color"
              :label="estadoDe(props.row.status).texto"
            />
          </q-td>
        </template>

        <!-- Acciones por fila: caja con fondo propio y etiqueta en
             pantallas medianas, para que no haya que adivinar el icono -->
        <template #body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              color="primary"
              icon="edit"
              class="boton-fila"
              title="Editar usuario"
              aria-label="Editar usuario"
              @click="editar(props.row)"
            >
              <span class="boton-fila__texto gt-sm">Editar</span>
            </q-btn>
            <!--
              Desactivar la propia cuenta queda bloqueado aquí Y también en el
              backend: si no, el admin se quedaría sin poder entrar.
              El botón deshabilitado se mantiene visible (fondo propio) para
              que se entienda que existe y que está apagado, no que falta.
            -->
            <q-btn
              flat
              :color="Number(props.row.status) === 0 ? 'negative' : 'positive'"
              :icon="Number(props.row.status) === 0 ? 'block' : 'check_circle'"
              class="boton-fila"
              :title="
                esMiCuenta(props.row)
                  ? 'No puedes desactivar tu propia cuenta'
                  : Number(props.row.status) === 0
                    ? 'Desactivar'
                    : 'Activar'
              "
              :aria-label="
                esMiCuenta(props.row)
                  ? 'No puedes desactivar tu propia cuenta'
                  : Number(props.row.status) === 0
                    ? 'Desactivar'
                    : 'Activar'
              "
              :disable="esMiCuenta(props.row) && Number(props.row.status) === 0"
              @click="cambiarEstado(props.row)"
            >
              <span class="boton-fila__texto gt-sm">
                {{ Number(props.row.status) === 0 ? "Desactivar" : "Activar" }}
              </span>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <FormUsuario v-model="dialogoAbierto" :usuario="usuarioEnEdicion" />
  </div>
</template>

