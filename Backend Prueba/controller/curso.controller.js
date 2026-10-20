import Curso from "../models/Curso.js";

const cursoCtrl = {};

// Registrar un nuevo curso
cursoCtrl.registerCurso = async (req, res) => {
  const { codigo, nombre, duracion } = req.body;
  try {
    const newCurso = new Curso({
      codigo: codigo.toUpperCase().trim(),
      nombre: nombre.toUpperCase().trim(),
      duracion,
    });
    await newCurso.save();
    res.json({ msg: "Curso registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Listar cursos (opcionalmente filtrados por status: /api/cursos?status=0)
cursoCtrl.getCursos = async (req, res) => {
  const { status } = req.query;
  try {
    const cursos = await Curso.find(status ? { status } : {}).sort({
      createdAt: -1,
    });
    res.json(cursos);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Obtener un curso por id
cursoCtrl.getCursoId = async (req, res) => {
  const { id } = req.params;
  try {
    const curso = await Curso.findById(id);
    res.json(curso);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Actualizar un curso
cursoCtrl.updateCurso = async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, duracion } = req.body;
  try {
    await Curso.findByIdAndUpdate(id, {
      codigo: codigo.toUpperCase().trim(),
      nombre: nombre.toUpperCase().trim(),
      duracion,
    });
    res.json({ msg: "Curso actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Activar un curso (status 0). No se borra el registro, solo se cambia el estado.
cursoCtrl.activeCurso = async (req, res) => {
  const { id } = req.params;
  try {
    await Curso.findByIdAndUpdate(id, { status: 0 });
    res.json({ msg: "Curso activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Desactivar un curso (status 1)
cursoCtrl.inactiveCurso = async (req, res) => {
  const { id } = req.params;
  try {
    await Curso.findByIdAndUpdate(id, { status: 1 });
    res.json({ msg: "Curso desactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { cursoCtrl };
