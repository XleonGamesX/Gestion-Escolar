import bcrypt from "bcryptjs";

import Usuario from "../models/Usuario.js";
import { generarJWT } from "../helpers/generarJWT.js";

const usuarioCtrl = {};

/**
 * Registrar un nuevo usuario.
 *
 * La contraseña NUNCA se guarda tal cual. Se le aplica un hash con bcrypt:
 *   "123456"  ->  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
 *
 * El hash va en un solo sentido: de la contraseña se saca el hash, pero del
 * hash no se puede volver a la contraseña. Por eso al iniciar sesion no se
 * "desencripta" nada: se hashea lo que escribio el usuario y se comparan los
 * dos hashes (eso hace bcrypt.compareSync).
 *
 * El "salt" es un texto aleatorio que se mezcla antes de hashear, para que dos
 * personas con la misma contraseña no terminen con el mismo hash.
 */
usuarioCtrl.registerUsuario = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const newUsuario = new Usuario({
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      // Si no llega rol, el modelo aplica su default "USER".
      ...(rol ? { rol } : {}),
    });

    // Hashear antes de guardar
    const salt = bcrypt.genSaltSync(10);
    newUsuario.password = bcrypt.hashSync(password, salt);

    await newUsuario.save();
    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Iniciar sesion.
 *
 * Responde { usuario, token }. El "usuario" sale sin password gracias al
 * metodo toJSON del modelo.
 *
 * Fijense que los tres errores posibles (email que no existe, usuario inactivo,
 * contraseña equivocada) responden casi lo mismo. Es a proposito: si dijeramos
 * "ese email no existe", le estariamos confirmando a un atacante cuales correos
 * SI estan registrados.
 */
usuarioCtrl.loginUsuario = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

    if (!usuario) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }

    if (usuario.status !== 0) {
      return res.status(400).json({ msg: "El usuario esta inactivo" });
    }

    // Compara la contraseña escrita contra el hash guardado.
    const passwordValido = bcrypt.compareSync(password, usuario.password);

    if (!passwordValido) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }

    // Todo bien: se genera el token con el id del usuario adentro.
    const token = await generarJWT(usuario._id);

    res.json({ usuario, token });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Listar usuarios.
 * El password nunca sale: el metodo toJSON del modelo lo elimina de cada
 * documento antes de que llegue a res.json().
 * @param {string} [status] - Query opcional: 0 = activos, 1 = inactivos.
 */
usuarioCtrl.getUsuarios = async (req, res) => {
  const { status } = req.query;
  try {
    const usuarios = await Usuario.find(status ? { status } : {}).sort({
      createdAt: -1,
    });
    res.json(usuarios);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Obtener un usuario por id.
 */
usuarioCtrl.getUsuarioId = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Actualizar un usuario.
 *
 * La contraseña es OPCIONAL: si no llega (o llega vacia) el usuario conserva
 * la que tenia. Si llega, se hashea igual que en el registro. Nunca se guarda
 * ni se devuelve en texto plano.
 */
usuarioCtrl.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol } = req.body;
  try {
    const datos = {
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
    };

    if (rol) datos.rol = rol;

    if (password && password.trim() !== "") {
      const salt = bcrypt.genSaltSync(10);
      datos.password = bcrypt.hashSync(password, salt);
    }

    await Usuario.findByIdAndUpdate(id, datos);
    res.json({ msg: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Activar un usuario (status 0). No se borra el registro, solo se cambia el
 * estado, igual que en Curso y Aprendiz (borrado logico).
 */
usuarioCtrl.activeUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await Usuario.findByIdAndUpdate(id, { status: 0 });
    res.json({ msg: "Usuario activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Desactivar un usuario (status 1).
 *
 * Proteccion extra: nadie puede desactivar SU PROPIA cuenta desde el CRUD.
 * Sin esto un admin podria quedarse fuera de la aplicacion sin remedio, porque
 * validateJWT rechaza cualquier token de un usuario inactivo.
 */
usuarioCtrl.inactiveUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.usuario._id.toString() === id) {
      return res
        .status(400)
        .json({ msg: "No puedes desactivar tu propia cuenta" });
    }

    await Usuario.findByIdAndUpdate(id, { status: 1 });
    res.json({ msg: "Usuario desactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { usuarioCtrl };
