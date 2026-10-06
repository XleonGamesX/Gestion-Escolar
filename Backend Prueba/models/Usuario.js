/**
 * @typedef {Object} Usuario
 * @property {string} nombre - Nombre completo del usuario.
 * @property {string} email - Correo con el que inicia sesion (unico).
 * @property {string} password - Contraseña HASHEADA. Nunca se guarda en texto plano.
 * @property {string} rol - Rol del usuario. "ADMIN" o "USER".
 * @property {number} status - 0 = activo, 1 = inactivo.
 * @property {Date} createdAt - Fecha de creacion.
 * @property {Date} updatedAt - Fecha de ultima actualizacion.
 */
import { Schema, model } from "mongoose";

const UsuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      default: "USER",
      enum: ["ADMIN", "USER"], // solo se aceptan estos dos valores
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * toJSON se ejecuta cada vez que un usuario se convierte a JSON, o sea CADA VEZ
 * que se manda en un res.json(). Aqui se aprovecha para quitar el password
 * antes de que salga del servidor.
 *
 * Esto es lo mas importante de este modelo: aunque el password esta hasheado,
 * un hash nunca se le muestra al cliente. Sin este metodo, el login devolveria
 * el hash al frontend y se veria en la pestana Network del navegador.
 *
 * @returns {Object} el usuario sin password ni __v
 */
UsuarioSchema.methods.toJSON = function () {
  const { __v, password, ...usuario } = this.toObject();
  return usuario;
};

export default model("Usuario", UsuarioSchema);
