import Aprendiz from "../models/Aprendiz.js";

const aprendizCtrl = {};

// Registrar un nuevo aprendiz
aprendizCtrl.registerAprendiz = async (req, res) => {
  const { documento, nombre, email, curso } = req.body;
  try {
    const newAprendiz = new Aprendiz({
      documento: documento.trim(),
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      curso,
    });
    await newAprendiz.save();
    res.json({ msg: "Aprendiz registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Listar aprendices. populate("curso") reemplaza el id por el documento completo del curso.
aprendizCtrl.getAprendices = async (req, res) => {
  const { status } = req.query;
  try {
    const aprendices = await Aprendiz.find(status ? { status } : {})
      .populate("curso")
      .sort({ createdAt: -1 });
    res.json(aprendices);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Obtener un aprendiz por id
aprendizCtrl.getAprendizId = async (req, res) => {
  const { id } = req.params;
  try {
    const aprendiz = await Aprendiz.findById(id).populate("curso");
    res.json(aprendiz);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Listar los aprendices de un curso (ejemplo de consulta por relacion)
aprendizCtrl.getAprendicesByCurso = async (req, res) => {
  const { curso } = req.params;
  try {
    const aprendices = await Aprendiz.find({ curso, status: 0 }).populate("curso");
    res.json(aprendices);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Actualizar un aprendiz
aprendizCtrl.updateAprendiz = async (req, res) => {
  const { id } = req.params;
  const { documento, nombre, email, curso } = req.body;
  try {
    await Aprendiz.findByIdAndUpdate(id, {
      documento: documento.trim(),
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      curso,
    });
    res.json({ msg: "Aprendiz actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Activar aprendiz (status 0)
aprendizCtrl.activeAprendiz = async (req, res) => {
  const { id } = req.params;
  try {
    await Aprendiz.findByIdAndUpdate(id, { status: 0 });
    res.json({ msg: "Aprendiz activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Desactivar aprendiz (status 1)
aprendizCtrl.inactiveAprendiz = async (req, res) => {
  const { id } = req.params;
  try {
    await Aprendiz.findByIdAndUpdate(id, { status: 1 });
    res.json({ msg: "Aprendiz desactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { aprendizCtrl };
