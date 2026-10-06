/**
 * @fileoverview Middleware que protege las rutas privadas.
 *
 * Se pone ANTES del controlador. Si el token no sirve, corta la peticion con un
 * 401 y el controlador nunca se ejecuta:
 *
 *   this.app.use("/api/cursos", validateJWT, routerCurso);
 *
 * 401 (Unauthorized) = "no se quien eres". Es el codigo que el frontend usa
 * para cerrar la sesion y mandar al login.
 *
 * @module middlewares/validateJWT
 */
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

/**
 * Verifica el token que llega en la cabecera x-token.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const validateJWT = async (req, res, next) => {
  // El token NO viaja en el body ni en la URL: viaja en una cabecera.
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({ msg: "No hay token en la peticion" });
  }

  try {
    // verify hace dos cosas: revisa la firma con la clave secreta y revisa que
    // no este vencido. Si algo falla, lanza una excepcion y cae en el catch.
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    // El token es valido, pero eso no basta: el usuario pudo haber sido borrado
    // o desactivado DESPUES de que se genero el token.
    const usuario = await Usuario.findById(uid);

    if (!usuario) {
      return res.status(401).json({ msg: "Token no valido - el usuario no existe" });
    }

    if (usuario.status !== 0) {
      return res.status(401).json({ msg: "Token no valido - el usuario esta inactivo" });
    }

    // Se deja el usuario en el req para que los controladores sepan quien pidio
    // la operacion (util para auditoria o para filtrar por dueño).
    req.usuario = usuario;

    next(); // todo en orden: que siga al controlador
  } catch (error) {
    res.status(401).json({ msg: "Token no valido" });
  }
};

export { validateJWT };
