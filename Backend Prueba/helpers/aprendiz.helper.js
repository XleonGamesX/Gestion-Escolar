import Aprendiz from "../models/Aprendiz.js";
import Curso from "../models/Curso.js";

/**
 * Funciones de apoyo para las validaciones de aprendiz.
 * @namespace aprendizHelper
 */
const aprendizHelper = {};

/**
 * Valida que exista un aprendiz con ese id.
 * @param {string} id
 * @throws {Error} Si el aprendiz no existe.
 */
aprendizHelper.validateExistAprendizById = async (id) => {
  const aprendiz = await Aprendiz.findById(id);
  if (!aprendiz) {
    throw new Error("El aprendiz no existe");
  }
};

/**
 * Valida que el curso enviado exista y este activo.
 * @param {string} id
 * @throws {Error} Si el curso no existe o esta inactivo.
 */
aprendizHelper.validateExistCurso = async (id) => {
  const curso = await Curso.findOne({ _id: id, status: 0 });
  if (!curso) {
    throw new Error("El curso no existe o esta inactivo");
  }
};

/**
 * Valida que el documento no este repetido.
 * @param {string} documento
 * @param {string} [id=null] - Id a excluir (se usa al actualizar).
 * @throws {Error} Si el documento ya esta registrado.
 */
aprendizHelper.validateExistDocumento = async (documento, id = null) => {
  const aprendiz = await Aprendiz.findOne({ documento: documento.trim() });
  if (aprendiz) {
    if (!id || aprendiz._id.toString() !== id.toString()) {
      throw new Error("El documento ya esta registrado");
    }
  }
};

export { aprendizHelper };
