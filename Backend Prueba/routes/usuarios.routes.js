import { Router } from "express";
import { usuarioCtrl } from "../controller/usuario.controller.js";
import { usuarioVali } from "../validations/usuario.validation.js";
import { validateJWT } from "../middlewares/validateJWT.js";

const { validateRegisterUsuario, validateLogin, validateUpdateUsuario, validateExistUsuario } =
  usuarioVali;
const {
  registerUsuario,
  loginUsuario,
  getUsuarios,
  getUsuarioId,
  updateUsuario,
  activeUsuario,
  inactiveUsuario,
} = usuarioCtrl;

const routerUsuario = Router();

// El LOGIN es la unica ruta publica de todo el backend: es la puerta por la que
// se consigue el token. Si tambien pidiera token, nadie podria entrar nunca
// (el clasico problema del huevo y la gallina).
//
// POST /api/usuarios/login    -> iniciar sesion y recibir el token
routerUsuario.post("/login", validateLogin, loginUsuario);

// De aqui en adelante TODAS las rutas piden token. El middleware validateJWT va
// ruta por ruta (y no en server.js, como en cursos/aprendices) porque el
// montaje /api/usuarios es publico: ahi conviven la puerta de entrada y el
// CRUD interno.
//
// El REGISTRO es interno: crear cuentas es una tarea de alguien que ya entro.
// El primer usuario lo crea el seed (npm run seed), que escribe directamente
// en la base de datos sin pasar por la API.
//
// POST   /api/usuarios/register        -> crear cuenta
routerUsuario.post(
  "/register",
  validateJWT,
  validateRegisterUsuario,
  registerUsuario
);

// GET    /api/usuarios                 -> lista todos (?status=0 filtra)
routerUsuario.get("/", validateJWT, getUsuarios);

// OJO: este va despues de "/" y nunca tapa /login: son metodos distintos
// (POST /login vs GET /:id), asi que no se pisan.
// GET    /api/usuarios/:id             -> uno por id
routerUsuario.get("/:id", validateJWT, validateExistUsuario, getUsuarioId);

// PUT    /api/usuarios/update/:id      -> actualizar (password opcional)
routerUsuario.put(
  "/update/:id",
  validateJWT,
  validateUpdateUsuario,
  updateUsuario
);

// PUT    /api/usuarios/active/:id      -> activar
routerUsuario.put("/active/:id", validateJWT, validateExistUsuario, activeUsuario);

// PUT    /api/usuarios/inactive/:id    -> desactivar (no permite la propia)
routerUsuario.put(
  "/inactive/:id",
  validateJWT,
  validateExistUsuario,
  inactiveUsuario
);

export { routerUsuario };
