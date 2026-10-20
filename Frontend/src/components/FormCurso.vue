<script setup>
import { ref, watch } from "vue";

import { alertas } from "../helpers/alertas.js";
import { mensajeDeError } from "../helpers/errorHandler.js";
import { useCursosStore } from "../stores/cursos.store.js";

/**
 * Formulario de CURSO dentro de un q-dialog.
 *
 * REGLA DEL PROYECTO: aquí NO hay ninguna validación de HTML (required,
 * pattern, minlength...) ni reglas propias. Se envía lo que escribió el
 * usuario y quien valida es el BACKEND; si algo falla se muestran sus
 * mensajes con SweetAlert2, justo debajo de donde se está trabajando.
 */
const props = defineProps({
  /** true/false: controla si el diálogo está abierto. */
  modelValue: { type: Boolean, default: false },
  /** Curso a editar, o null cuando se está creando. */
  curso: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue"]);

const cursosStore = useCursosStore();

const formulario = ref({ codigo: "", nombre: "", duracion: "" });
const guardando = ref(false);

// Al abrir el diálogo se carga el registro (o un formulario limpio).
watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return;
    formulario.value = props.curso
      ? {
          codigo: props.curso.codigo,
          nombre: props.curso.nombre,
          duracion: String(props.curso.duracion),
        }
      : { codigo: "", nombre: "", duracion: "" };
  }
);

function cerrar() {
  emit("update:modelValue", false);
}

async function guardar() {
  guardando.value = true;
  try {
    const datos = { ...formulario.value };
    const mensaje = props.curso
      ? await cursosStore.actualizar(props.curso._id, datos)
      : await cursosStore.crear(datos);

    cerrar();
    alertas.exito(props.curso ? "Curso actualizado" : "Curso creado", mensaje);
  } catch (e) {
    // 400 del backend: aquí aparecen "El codigo es obligatorio", etc.
    alertas.error("No se pudo guardar el curso", mensajeDeError(e));
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
    <q-card class="q-pa-sm formulario-dialogo" style="min-width: 360px; max-width: 95vw">
      <q-card-section class="row items-center q-gutter-md cabecera-formulario">
        <q-avatar color="primary" text-color="white" icon="school" size="48px" />
        <div>
          <div class="text-h6">
            {{ curso ? "Editar curso" : "Nuevo curso" }}
          </div>
          <div class="text-caption texto-tenue">
            {{
              curso
                ? "Modifica los datos del curso seleccionado."
                : "Completa los datos para registrar un curso."
            }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md q-pt-md">
        <q-input
          v-model="formulario.codigo"
          outlined
          dense
          label="Código"
          placeholder="Ej. ADSO-01"
          color="primary"
        >
          <template #prepend>
            <q-icon name="tag" />
          </template>
        </q-input>

        <q-input
          v-model="formulario.nombre"
          outlined
          dense
          label="Nombre del curso"
          placeholder="Ej. Análisis y desarrollo de software"
          color="primary"
        >
          <template #prepend>
            <q-icon name="menu_book" />
          </template>
        </q-input>

        <q-input
          v-model="formulario.duracion"
          outlined
          dense
          type="number"
          label="Duración (horas)"
          placeholder="Ej. 2640"
          color="primary"
        >
          <template #prepend>
            <q-icon name="schedule" />
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
          :disable="guardando"
          @click="cerrar"
        />
        <q-btn
          unelevated
          no-caps
          :label="curso ? 'Guardar cambios' : 'Crear curso'"
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
