import { Router } from "express";
import { cursoCtrl } from "../controller/curso.controller.js";
import { cursoVali } from "../validations/curso.validation.js";

const {
  validateRegisterCurso,
  validateUpdateCurso,
  validateExistCurso,
} = cursoVali;

const {
  registerCurso,
  getCursos,
  getCursoId,
  updateCurso,
  activeCurso,
  inactiveCurso,
} = cursoCtrl;

const routerCurso = Router();

// GET    /api/cursos            -> lista todos
routerCurso.get("/", getCursos);

// GET    /api/cursos/:id        -> uno por id
routerCurso.get("/:id", validateExistCurso, getCursoId);

// POST   /api/cursos/register   -> crear
routerCurso.post("/register", validateRegisterCurso, registerCurso);

// PUT    /api/cursos/update/:id -> actualizar
routerCurso.put("/update/:id", validateUpdateCurso, updateCurso);

// PUT    /api/cursos/active/:id -> activar
routerCurso.put("/active/:id", validateExistCurso, activeCurso);

// PUT    /api/cursos/inactive/:id -> desactivar
routerCurso.put("/inactive/:id", validateExistCurso, inactiveCurso);

export { routerCurso };
