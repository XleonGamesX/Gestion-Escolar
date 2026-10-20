<script setup>
import { computed, onMounted, ref } from "vue";

import AlertaError from "../components/AlertaError.vue";
import FormCurso from "../components/FormCurso.vue";
import { alertas } from "../helpers/alertas.js";
import { mensajeDeError } from "../helpers/errorHandler.js";
import { estadoDe, fechaCorta } from "../helpers/formato.js";
import { useCursosStore } from "../stores/cursos.store.js";

const cursosStore = useCursosStore();

// ── Estado de la pantalla ──────────────────────────────────────────
const buscar = ref("");
const filtro = ref("todos"); // todos | activos | inactivos
const dialogoAbierto = ref(false);
const cursoEnEdicion = ref(null);

const opcionesFiltro = [
  { label: "Todos", value: "todos", icon: "list_alt" },
  { label: "Activos", value: "activos", icon: "check_circle" },
  { label: "Inactivos", value: "inactivos", icon: "block" },
];

const columnas = [
  { name: "codigo", label: "Código", field: "codigo", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  {
    name: "duracion",
    label: "Duración",
    field: "duracion",
    align: "center",
    sortable: true,
    format: (valor) => `${valor} h`,
  },
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

/** Filtrado en memoria: el usuario ve lo que pide sin esperar al servidor. */
const cursosFiltrados = computed(() => {
  let lista = cursosStore.cursos;

  if (filtro.value === "activos") {
    lista = lista.filter((curso) => Number(curso.status) === 0);
  } else if (filtro.value === "inactivos") {
    lista = lista.filter((curso) => Number(curso.status) !== 0);
  }

  const texto = buscar.value.trim().toLowerCase();
  if (texto) {
    lista = lista.filter((curso) =>
      `${curso.codigo} ${curso.nombre}`.toLowerCase().includes(texto)
    );
  }

  return lista;
});

// ── Acciones ───────────────────────────────────────────────────────
function cargar() {
  return cursosStore.listar();
}

function nuevo() {
  cursoEnEdicion.value = null;
  dialogoAbierto.value = true;
}

function editar(curso) {
  cursoEnEdicion.value = curso;
  dialogoAbierto.value = true;
}

async function cambiarEstado(curso) {
  const activo = Number(curso.status) === 0;

  const confirmado = await alertas.confirmar({
    titulo: activo ? "¿Desactivar el curso?" : "¿Activar el curso?",
    mensaje: activo
      ? `El curso «${curso.nombre}» dejará de estar disponible. No se borra, solo cambia de estado.`
      : `El curso «${curso.nombre}» volverá a estar disponible.`,
    textoConfirmar: activo ? "Desactivar" : "Activar",
  });

  if (!confirmado) return;

  try {
    const mensaje = await cursosStore.cambiarEstado(curso._id, !activo);
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
      <h1 class="titulo-pantalla">Cursos</h1>
      <p class="subtitulo-pantalla">
        Administra los programas formativos: crear, editar y activar o
        desactivar.
      </p>
    </div>

    <AlertaError :mensaje="cursosStore.error" @reintentar="cargar" />

    <q-card class="tarjeta-resumen">
      <q-table
        :rows="cursosFiltrados"
        :columns="columnas"
        row-key="_id"
        :loading="cursosStore.cargando"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20]"
        no-data-label="No hay cursos que coincidan con el filtro"
      >
        <!-- Barra superior: título, buscador, filtro y acción principal -->
        <template #top>
          <div class="barra-tabla">
            <div class="barra-tabla__titulo">
              <div class="titulo-bloque">Listado de cursos</div>
              <div class="text-caption texto-tenue">
                {{ cursosFiltrados.length }} de {{ cursosStore.cursos.length }}
                registros
              </div>
            </div>

            <q-input
              v-model="buscar"
              outlined
              dense
              clearable
              placeholder="Buscar por código o nombre"
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
              label="Nuevo curso"
              class="boton-principal-tabla"
              @click="nuevo"
            />
          </div>
        </template>

        <!-- Estado: sin registros y sin error -->
        <template #no-data>
          <div class="row items-center justify-center q-pa-lg text-grey-7">
            <q-icon name="search_off" size="28px" class="q-mr-sm" />
            <span>
              {{
                cursosStore.error
                  ? "No se pudo cargar la información"
                  : "Todavía no hay cursos registrados. Crea el primero con el botón «Nuevo curso»."
              }}
            </span>
          </div>
        </template>

        <!-- Estado del registro: activo / inactivo -->
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
              title="Editar curso"
              aria-label="Editar curso"
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

    <FormCurso v-model="dialogoAbierto" :curso="cursoEnEdicion" />
  </div>
</template>

