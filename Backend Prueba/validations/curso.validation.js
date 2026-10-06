/**
 * @fileoverview Cadenas de validacion para las rutas de curso.
 * Cada propiedad es un ARRAY de middlewares que Express ejecuta en orden
 * antes de llegar al controlador.
 *
 * Patron usado en cada campo:
 *   check(campo).notEmpty().bail().<formato>().bail().custom(<consulta BD>)
 *
 * .bail()  -> si la regla anterior fallo, deja de validar ESTE campo.
 *             Asi evitamos consultar la base de datos con datos imposibles
 *             (por ejemplo un id con formato invalido) y que se filtren
 *             errores crudos de Mongoose al frontend.
 *             Ojo: .bail() solo aplica dentro de la MISMA cadena check(),
 *             por eso todas las reglas de un campo van encadenadas.
 *
 * @module validations/curso.validation
 */
import { check } from "express-validator";
import { validateFields } from "../middlewares/validateFields.js";
import { cursoHelper } from "../helpers/curso.helper.js";

const { validateExistCursoById, validateExistCodigo } = cursoHelper;

const cursoVali = {};

/**
 * Valida los datos para registrar un curso.
 */
cursoVali.validateRegisterCurso = [
  check("codigo", "El codigo es obligatorio")
    .notEmpty()
    .bail()
    .custom(async (codigo) => {
      await validateExistCodigo(codigo);
    }),
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("duracion", "La duracion es obligatoria")
    .notEmpty()
    .bail()
    .isInt({ min: 1 })
    .withMessage("La duracion debe ser un numero mayor a 0"),
  validateFields,
];

/**
 * Valida los datos para actualizar un curso.
 */
cursoVali.validateUpdateCurso = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistCursoById(id);
    }),
  check("codigo", "El codigo es obligatorio")
    .notEmpty()
    .bail()
    .custom(async (codigo, { req }) => {
      await validateExistCodigo(codigo, req.params.id);
    }),
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("duracion", "La duracion es obligatoria")
    .notEmpty()
    .bail()
    .isInt({ min: 1 })
    .withMessage("La duracion debe ser un numero mayor a 0"),
  validateFields,
];

/**
 * Valida que el id enviado por la url corresponda a un curso existente.
 */
cursoVali.validateExistCurso = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistCursoById(id);
    }),
  validateFields,
];

export { cursoVali };
