/**
 * @typedef {Object} Aprendiz
 * @property {string} documento - Numero de documento (unico).
 * @property {string} nombre - Nombre completo del aprendiz.
 * @property {string} email - Correo del aprendiz.
 * @property {Schema.Types.ObjectId} curso - Curso al que pertenece (relacion con Curso).
 * @property {number} status - 0 = activo, 1 = inactivo.
 * @property {Date} createdAt - Fecha de creacion.
 * @property {Date} updatedAt - Fecha de ultima actualizacion.
 */
import { Schema, model } from "mongoose";

const AprendizSchema = new Schema(
  {
    documento: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    curso: {
      type: Schema.Types.ObjectId,
      ref: "Curso", // relacion: permite usar .populate("curso")
      required: true,
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

export default model("Aprendiz", AprendizSchema);
