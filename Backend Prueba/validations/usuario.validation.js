/**
 * @fileoverview Cadenas de validacion para las rutas de usuario.
 * Mismo patron que curso.validation.js: todas las reglas de un campo van
 * encadenadas y separadas por .bail(). Ver la explicacion completa alla.
 * @module validations/usuario.validation
 */
import { check } from "express-validator";
import { validateFields } from "../middlewares/validateFields.js";
import { usuarioHelper } from "../helpers/usuario.helper.js";

const { validateExistEmail, validateExistUsuarioById } = usuarioHelper;

const usuarioVali = {};

/**
 * Valida el rol SOLO si viene en el body.
 * Se usa .custom() en vez de .optional().isIn() para que un valor vacio ("")
 * o nulo tambien cuente como "no me diste rol" y el modelo aplique su default.
 * @param {*} rol
 * @throws {Error} Si el rol no es ADMIN ni USER.
 */
function validarRolOpcional(rol) {
  if (rol === undefined || rol === null || rol === "") return true;
  if (!["ADMIN", "USER"].includes(rol)) {
    throw new Error("El rol no es valido");
  }
  return true;
}

/**
 * Valida la contraseña SOLO si viene y ademas tiene contenido.
 * Permite omitirla o mandarla vacia al ACTUALIZAR: en ese caso el usuario
 * conserva la contraseña que ya tenia.
 * @param {*} password
 * @throws {Error} Si tiene menos de 6 caracteres.
 */
function validarPasswordOpcional(password) {
  if (password === undefined || password === null || password === "") {
    return true;
  }
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
  return true;
}

/**
 * Valida los datos para registrar un usuario.
 */
usuarioVali.validateRegisterUsuario = [
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido")
    .bail()
    .custom(async (email) => {
      await validateExistEmail(email);
    }),
  check("password", "La contraseña es obligatoria")
    .notEmpty()
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  // El rol es opcional: si no llega, el modelo usa su default "USER".
  check("rol").custom(validarRolOpcional),
  validateFields,
];

/**
 * Valida los datos para iniciar sesion.
 *
 * Ojo: aqui NO se consulta la base de datos. Si el email existe o no, y si la
 * contraseña coincide, se resuelve en el controlador y con un mensaje generico.
 * Decir "ese email no existe" le confirmaria a un atacante que correos SI estan
 * registrados.
 */
usuarioVali.validateLogin = [
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido"),
  check("password", "La contraseña es obligatoria").notEmpty(),
  validateFields,
];

/**
 * Valida los datos para actualizar un usuario.
 *
 * password y rol son opcionales: al editar, un campo vacio significa
 * "no cambiarlo". El email excluye el propio id para permitir que conserve
 * su correo actual (mismo criterio que validateExistCodigo de curso).
 */
usuarioVali.validateUpdateUsuario = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistUsuarioById(id);
    }),
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido")
    .bail()
    .custom(async (email, { req }) => {
      await validateExistEmail(email, req.params.id);
    }),
  check("password").custom(validarPasswordOpcional),
  check("rol").custom(validarRolOpcional),
  validateFields,
];

/**
 * Valida que el id enviado por la url corresponda a un usuario existente.
 * Se usa en las rutas de lectura y en active/inactive, que solo necesitan
 * saber que el registro existe (mismo patron que curso y aprendiz).
 */
usuarioVali.validateExistUsuario = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistUsuarioById(id);
    }),
  validateFields,
];

export { usuarioVali };
