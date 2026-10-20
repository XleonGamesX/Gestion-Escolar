import Curso from "../models/Curso.js";

/**
 * Funciones de apoyo para las validaciones de curso.
 * Un helper solo consulta la base de datos y lanza un Error si algo no cumple.
 * @namespace cursoHelper
 */
const cursoHelper = {};

/**
 * Valida que exista un curso con ese id.
 * @param {string} id
 * @throws {Error} Si el curso no existe.
 */
cursoHelper.validateExistCursoById = async (id) => {
  const curso = await Curso.findById(id);
  if (!curso) {
    throw new Error("El curso no existe");
  }
};

/**
 * Valida que el codigo no este repetido.
 * @param {string} codigo
 * @param {string} [id=null] - Id a excluir (se usa al actualizar).
 * @throws {Error} Si el codigo ya esta registrado.
 */
cursoHelper.validateExistCodigo = async (codigo, id = null) => {
  const curso = await Curso.findOne({ codigo: codigo.toUpperCase().trim() });
  if (curso) {
    if (!id || curso._id.toString() !== id.toString()) {
      throw new Error("El codigo del curso ya esta registrado");
    }
  }
};

export { cursoHelper };
