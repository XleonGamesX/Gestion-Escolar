/**
 * Middleware que revisa los errores acumulados por express-validator.
 * Si hay errores responde 400 con la lista de mensajes; si no, continua (next).
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
import { validationResult } from "express-validator";

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((error) => error.msg);
    return res.status(400).json({ msg: "Error en la validacion", errors: err });
  }
  next();
};

export { validateFields };
