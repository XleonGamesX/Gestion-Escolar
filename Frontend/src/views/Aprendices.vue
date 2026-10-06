<script setup>
import { computed, onMounted, ref } from "vue";

import AlertaError from "../components/AlertaError.vue";
import FormAprendiz from "../components/FormAprendiz.vue";
import { alertas } from "../helpers/alertas.js";
import { mensajeDeError } from "../helpers/errorHandler.js";
import { estadoDe, fechaCorta } from "../helpers/formato.js";
import { useAprendicesStore } from "../stores/aprendices.store.js";
import { useCursosStore } from "../stores/cursos.store.js";

const aprendicesStore = useAprendicesStore();
const cursosStore = useCursosStore();

// ── Estado de la pantalla ──────────────────────────────────────────
const buscar = ref("");
const filtro = ref("todos");
const dialogoAbierto = ref(false);
const aprendizEnEdicion = ref(null);

const opcionesFiltro = [
  { label: "Todos", value: "todos", icon: "list_alt" },
  { label: "Activos", value: "activos", icon: "check_circle" },
  { label: "Inactivos", value: "inactivos", icon: "block" },
];

const columnas = [
  { name: "documento", label: "Documento", field: "documento", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "email", label: "Correo", field: "email", align: "left", sortable: true },
  {
    name: "curso",
    label: "Curso",
    field: (fila) => fila.curso?.nombre ?? "—",
    align: "left",
    sortable: true,
  },
  { name: "status", label: "Estado", field: "status", align: "center", sortable: true },
  {
    name: "createdAt",
    label: "Inscrito",
    field: "createdAt",
    align: "center",
    sortable: true,
    format: (valor) => fechaCorta(valor),
  },
  { name: "acciones", label: "Acciones", field: "_id", align: "right" },
];

const aprendicesFiltrados = computed(() => {
  let lista = aprendicesStore.aprendices;

  if (filtro.value === "activos") {
    lista = lista.filter((a) => Number(a.status) === 0);
  } else if (filtro.value === "inactivos") {
    lista = lista.filter((a) => Number(a.status) !== 0);
  }

  const texto = buscar.value.trim().toLowerCase();
  if (texto) {
    lista = lista.filter((a) =>
      `${a.documento} ${a.nombre} ${a.email} ${a.curso?.nombre ?? ""}`
        .toLowerCase()
        .includes(texto)
    );
  }

  return lista;
});

// ── Acciones ───────────────────────────────────────────────────────
function cargar() {
  return Promise.all([aprendicesStore.listar(), cursosStore.listar()]);
}

function nuevo() {
  aprendizEnEdicion.value = null;
  dialogoAbierto.value = true;
}

function editar(aprendiz) {
  aprendizEnEdicion.value = aprendiz;
  dialogoAbierto.value = true;
}

async function cambiarEstado(aprendiz) {
  const activo = Number(aprendiz.status) === 0;

  const confirmado = await alertas.confirmar({
    titulo: activo ? "¿Desactivar el aprendiz?" : "¿Activar el aprendiz?",
    mensaje: activo
      ? `Se desactivará a «${aprendiz.nombre}». El registro se conserva, solo cambia de estado.`
      : `Se activará a «${aprendiz.nombre}» para que vuelva a estar disponible.`,
    textoConfirmar: activo ? "Desactivar" : "Activar",
  });

  if (!confirmado) return;

  try {
    const mensaje = await aprendicesStore.cambiarEstado(aprendiz._id, !activo);
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
      <h1 class="titulo-pantalla">Aprendices</h1>
      <p class="subtitulo-pantalla">
        Gestiona los aprendices y el curso al que pertenecen.
      </p>
    </div>

    <AlertaError :mensaje="aprendicesStore.error" @reintentar="cargar" />

    <q-card class="tarjeta-resumen">
      <q-table
        :rows="aprendicesFiltrados"
        :columns="columnas"
        row-key="_id"
        :loading="aprendicesStore.cargando"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20]"
        no-data-label="No hay aprendices que coincidan con el filtro"
      >
        <template #top>
          <div class="barra-tabla">
            <div class="barra-tabla__titulo">
              <div class="titulo-bloque">Listado de aprendices</div>
              <div class="text-caption texto-tenue">
                {{ aprendicesFiltrados.length }} de
                {{ aprendicesStore.aprendices.length }} registros
              </div>
            </div>

            <q-input
              v-model="buscar"
              outlined
              dense
              clearable
              placeholder="Buscar por documento, nombre o correo"
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
              icon="add"
              label="Nuevo aprendiz"
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
                aprendicesStore.error
                  ? "No se pudo cargar la información"
                  : "Todavía no hay aprendices registrados."
              }}
            </span>
          </div>
        </template>

        <!-- El curso viene poblado desde el backend (populate) -->
        <template #body-cell-curso="props">
          <q-td :props="props">
            <!-- Fondo azul claro + texto oscuro: con texto blanco el azul
                 de marca no llegaba al contraste AA sobre ese fondo -->
            <q-badge
              v-if="props.row.curso"
              color="blue-1"
              text-color="dark"
              :label="`${props.row.curso.codigo} — ${props.row.curso.nombre}`"
            />
            <span v-else class="text-grey-6">Sin curso</span>
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

        <template #body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              color="primary"
              icon="edit"
              class="boton-fila"
              title="Editar aprendiz"
              aria-label="Editar aprendiz"
              @click="editar(props.row)"
            >
              <span class="boton-fila__texto gt-sm">Editar</span>
            </q-btn>
            <q-btn
              flat
              :color="Number(props.row.status) === 0 ? 'negative' : 'positive'"
              :icon="Number(props.row.status) === 0 ? 'block' : 'check_circle'"
              class="boton-fila"
              :title="Number(props.row.status) === 0 ? 'Desactivar' : 'Activar'"
              :aria-label="
                Number(props.row.status) === 0 ? 'Desactivar' : 'Activar'
              "
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

    <FormAprendiz v-model="dialogoAbierto" :aprendiz="aprendizEnEdicion" />
  </div>
</template>

