<script setup>
import { ref, watch } from "vue";

import { alertas } from "../helpers/alertas.js";
import { mensajeDeError } from "../helpers/errorHandler.js";
import { useUsuariosStore } from "../stores/usuarios.store.js";

/**
 * Formulario de USUARIO dentro de un q-dialog.
 * Sin validaciones de HTML ni del navegador: quien valida es el backend.
 * Al EDITAR, la contraseña vacía significa "no cambiarla" (así lo resuelve
 * el controlador del backend).
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  usuario: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue"]);

const usuariosStore = useUsuariosStore();

const formulario = ref({ nombre: "", email: "", password: "", rol: "USER" });
const guardando = ref(false);
const verPassword = ref(false);

const opcionesRol = [
  { label: "Administrador (ADMIN)", value: "ADMIN" },
  { label: "Usuario (USER)", value: "USER" },
];

watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return;
    formulario.value = props.usuario
      ? {
          nombre: props.usuario.nombre,
          email: props.usuario.email,
          password: "",
          rol: props.usuario.rol,
        }
      : { nombre: "", email: "", password: "", rol: "USER" };
    verPassword.value = false;
  }
);

function cerrar() {
  emit("update:modelValue", false);
}

async function guardar() {
  guardando.value = true;
  try {
    const datos = { ...formulario.value };
    const mensaje = props.usuario
      ? await usuariosStore.actualizar(props.usuario._id, datos)
      : await usuariosStore.crear(datos);

    cerrar();
    alertas.exito(props.usuario ? "Usuario actualizado" : "Usuario creado", mensaje);
  } catch (e) {
    alertas.error("No se pudo guardar el usuario", mensajeDeError(e));
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
        <q-avatar color="primary" text-color="white" icon="person_add" size="48px" />
        <div>
          <div class="text-h6">
            {{ usuario ? "Editar usuario" : "Nuevo usuario" }}
          </div>
          <div class="text-caption texto-tenue">
            {{
              usuario
                ? "Actualiza los datos de la cuenta."
                : "Crea una cuenta de acceso a la aplicación."
            }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md q-pt-md">
        <q-input
          v-model="formulario.nombre"
          outlined
          dense
          label="Nombre completo"
          placeholder="Ej. Docente Prueba"
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
          placeholder="Ej. docente@correo.com"
          color="primary"
        >
          <template #prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <q-input
          v-model="formulario.password"
          outlined
          dense
          :type="verPassword ? 'text' : 'password'"
          :label="usuario ? 'Nueva contraseña (opcional)' : 'Contraseña'"
          :placeholder="usuario ? 'Déjala vacía para mantener la actual' : 'Mínimo 6 caracteres'"
          color="primary"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
          <template #append>
            <q-icon
              :name="verPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="verPassword = !verPassword"
            />
          </template>
        </q-input>

        <q-select
          v-model="formulario.rol"
          outlined
          dense
          label="Rol"
          color="primary"
          :options="opcionesRol"
        >
          <template #prepend>
            <q-icon name="admin_panel_settings" />
          </template>
        </q-select>

        <div class="text-caption texto-tenue">
          La contraseña se guarda hasheada en el servidor; nunca se muestra ni
          se devuelve en texto plano.
        </div>
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
          :label="usuario ? 'Guardar cambios' : 'Crear usuario'"
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
