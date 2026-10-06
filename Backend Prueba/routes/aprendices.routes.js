import { Router } from "express";
import { aprendizCtrl } from "../controller/aprendiz.controller.js";
import { aprendizVali } from "../validations/aprendiz.validation.js";

const {
  validateRegisterAprendiz,
  validateUpdateAprendiz,
  validateExistAprendiz,
} = aprendizVali;

const {
  registerAprendiz,
  getAprendices,
  getAprendizId,
  getAprendicesByCurso,
  updateAprendiz,
  activeAprendiz,
  inactiveAprendiz,
} = aprendizCtrl;

const routerAprendiz = Router();

// GET /api/aprendices                 -> lista todos
routerAprendiz.get("/", getAprendices);

// OJO: esta ruta va ANTES de "/:id", de lo contrario Express interpretaria
// la palabra "curso" como si fuera un id.
// GET /api/aprendices/curso/:curso    -> aprendices de un curso
routerAprendiz.get("/curso/:curso", getAprendicesByCurso);

// GET /api/aprendices/:id             -> uno por id
routerAprendiz.get("/:id", validateExistAprendiz, getAprendizId);

// POST /api/aprendices/register       -> crear
routerAprendiz.post("/register", validateRegisterAprendiz, registerAprendiz);

// PUT /api/aprendices/update/:id      -> actualizar
routerAprendiz.put("/update/:id", validateUpdateAprendiz, updateAprendiz);

// PUT /api/aprendices/active/:id      -> activar
routerAprendiz.put("/active/:id", validateExistAprendiz, activeAprendiz);

// PUT /api/aprendices/inactive/:id    -> desactivar
routerAprendiz.put("/inactive/:id", validateExistAprendiz, inactiveAprendiz);

export { routerAprendiz };
