<script setup>
import { ref, watch } from "vue";

import { alertas } from "../helpers/alertas.js";
import { mensajeDeError } from "../helpers/errorHandler.js";
import { useAprendicesStore } from "../stores/aprendices.store.js";
import { useCursosStore } from "../stores/cursos.store.js";

/**
 * Formulario de APRENDIZ dentro de un q-dialog.
 * Sin validaciones de HTML ni del navegador: quien valida es el backend.
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  aprendiz: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue"]);

const aprendicesStore = useAprendicesStore();
const cursosStore = useCursosStore();

const formulario = ref({
  documento: "",
  nombre: "",
  email: "",
  curso: "",
});
const guardando = ref(false);

// Solo los cursos ACTIVOS se ofrecen para una inscripción nueva.
const cursosActivos = ref([]);
const cargandoCursos = ref(false);

watch(
  () => props.modelValue,
  async (abierto) => {
    if (!abierto) return;

    formulario.value = props.aprendiz
      ? {
          documento: props.aprendiz.documento,
          nombre: props.aprendiz.nombre,
          email: props.aprendiz.email,
          curso: props.aprendiz.curso?._id ?? "",
        }
      : { documento: "", nombre: "", email: "", curso: "" };

    cargandoCursos.value = true;
    try {
      cursosActivos.value = await cursosStore.listar(0);
    } finally {
      cargandoCursos.value = false;
    }
  }
);

function cerrar() {
  emit("update:modelValue", false);
}

async function guardar() {
  guardando.value = true;
  try {
    const datos = { ...formulario.value };
    const mensaje = props.aprendiz
      ? await aprendicesStore.actualizar(props.aprendiz._id, datos)
      : await aprendicesStore.crear(datos);

    cerrar();
    alertas.exito(
      props.aprendiz ? "Aprendiz actualizado" : "Aprendiz registrado",
      mensaje
    );
  } catch (e) {
    alertas.error("No se pudo guardar el aprendiz", mensajeDeError(e));
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="q-pa-sm formulario-dialogo" style="min-width: 380px; max-width: 95vw">
      <q-card-section class="row items-center q-gutter-md cabecera-formulario">
        <q-avatar color="primary" text-color="white" icon="badge" size="48px" />
        <div>
          <div class="text-h6">
            {{ aprendiz ? "Editar aprendiz" : "Nuevo aprendiz" }}
          </div>
          <div class="text-caption texto-tenue">
            {{ aprendiz ? "Actualiza los datos del aprendiz." : "Registra un aprendiz en un curso." }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md q-pt-md">
        <q-input
          v-model="formulario.documento"
          outlined
          dense
          label="Documento"
          placeholder="Ej. 1098765432"
          color="primary"
        >
          <template #prepend>
            <q-icon name="pin" />
          </template>
        </q-input>

        <q-input
          v-model="formulario.nombre"
          outlined
          dense
          label="Nombre completo"
          placeholder="Ej. Ana Gómez"
          color="primary"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="formulario.email"
          outlined
          dense
          label="Correo electrónico"
          placeholder="Ej. ana@correo.com"
          color="primary"
        >
          <template #prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <q-select
          v-model="formulario.curso"
          outlined
          dense
          emit-value
          map-options
          label="Curso"
          color="primary"
          :options="
            cursosActivos.map((c) => ({ label: `${c.codigo} — ${c.nombre}`, value: c._id }))
          "
          :loading="cargandoCursos"
          :disable="cargandoCursos"
        >
          <template #prepend>
            <q-icon name="school" />
          </template>
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay cursos activos disponibles
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          no-caps
          label="Cancelar"
          color="grey-8"
          class="boton-formulario boton-formulario--secundario"
          :disable="guardando"
          @click="cerrar"
        />
        <q-btn
          unelevated
          no-caps
          :label="aprendiz ? 'Guardar cambios' : 'Registrar aprendiz'"
          color="primary"
          icon="save"
          class="boton-formulario"
          :loading="guardando"
          @click="guardar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
