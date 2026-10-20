/**
 * Script de datos artificiales (seed / semilla).
 *
 * Genera e inserta cursos y 100 aprendices de ejemplo para practicar con la API
 * sin crearlos a mano. Cada aprendiz queda relacionado con un curso real
 * (por su _id), igual que lo haria el frontend.
 *
 * Tambien crea el usuario administrador con el que se inicia sesion, porque
 * ahora la API pide token y sin un usuario no habria como entrar.
 *
 * USO:
 *   node scripts/seed.js            -> agrega los datos (falla si el codigo/documento ya existe)
 *   node scripts/seed.js --reset    -> BORRA usuarios, cursos y aprendices y vuelve a insertar
 *
 * OJO: --reset elimina TODOS los usuarios, cursos y aprendices de la base
 * indicada en MONGO_URL. Uselo solo en la base de datos de practica.
 */
import dns from "dns";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Curso from "../models/Curso.js";
import Aprendiz from "../models/Aprendiz.js";
import Usuario from "../models/Usuario.js";

dotenv.config();

// Mismo arreglo que en database.js: las cadenas "mongodb+srv://" hacen una
// consulta DNS (SRV) que algunas redes rechazan ("querySrv ECONNREFUSED").
// Forzar un DNS publico lo resuelve.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Se activa si se ejecuta: node scripts/seed.js --reset
const RESET = process.argv.includes("--reset");

// Cuantos aprendices generar
const TOTAL_APRENDICES = 100;

// --- Usuario administrador ------------------------------------------------
// Credenciales de practica. En un proyecto real jamas se deja una contraseña
// asi escrita en el codigo.
const ADMIN = {
  nombre: "ADMINISTRADOR",
  email: "admin@sena.edu.co",
  password: "123456",
  rol: "ADMIN",
};

// --- Cursos base ----------------------------------------------------------
const cursosData = [
  { codigo: "ADSO-2874521", nombre: "ANALISIS Y DESARROLLO DE SOFTWARE", duracion: 2640 },
  { codigo: "MDR-2758410", nombre: "DESARROLLO WEB FRONTEND", duracion: 1320 },
  { codigo: "RED-2690135", nombre: "GESTION DE REDES DE DATOS", duracion: 1980 },
  { codigo: "MULTI-2541098", nombre: "PRODUCCION MULTIMEDIA", duracion: 2200 },
  { codigo: "CONTA-2410987", nombre: "CONTABILIDAD Y FINANZAS", duracion: 1760 },
  { codigo: "TALEN-2380456", nombre: "GESTION DEL TALENTO HUMANO", duracion: 1540 },
];

// --- Piezas para armar nombres y datos aleatorios -------------------------
const nombres = [
  "ANA", "CARLOS", "LAURA", "JUAN", "SOFIA", "MIGUEL", "VALERIA", "SANTIAGO",
  "ISABELLA", "SEBASTIAN", "MARIA", "ANDRES", "CAMILA", "DAVID", "VALENTINA",
  "DANIEL", "PAULA", "JUANITA", "FELIPE", "MARIANA", "NICOLAS", "SARA",
  "ALEJANDRO", "GABRIELA", "TOMAS", "LUCIA", "SAMUEL", "DANIELA", "MATEO", "SALOME",
];
const apellidos = [
  "GOMEZ", "PEREZ", "RUIZ", "TORRES", "HERNANDEZ", "CASTRO", "MORENO", "RAMIREZ",
  "VARGAS", "LOPEZ", "RODRIGUEZ", "MARTINEZ", "GONZALEZ", "SANCHEZ", "DIAZ",
  "ROJAS", "JIMENEZ", "MENDEZ", "ORTIZ", "GUERRERO", "MEDINA", "CARDENAS",
  "SUAREZ", "REYES", "CORTES", "PARRA", "NAVARRO", "ACOSTA", "QUINTERO", "MEJIA",
];

/**
 * Devuelve un elemento al azar de un arreglo.
 */
const alAzar = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Tabla de reemplazo para armar emails sin tildes ni ñ.
const acentos = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", ñ: "n" };

/**
 * Quita tildes/ñ para armar el email a partir del nombre.
 */
const sinTildes = (texto) =>
  texto.toLowerCase().replace(/[áéíóúüñ]/g, (letra) => acentos[letra]);

/**
 * Genera el arreglo de aprendices. Recibe los cursos ya creados para poder
 * asignar a cada aprendiz el _id de un curso real (relacion).
 * @param {Array} cursos - documentos de Curso ya insertados
 * @returns {Array} aprendices listos para insertar
 */
const generarAprendices = (cursos) => {
  const aprendices = [];
  const documentosUsados = new Set();

  for (let i = 0; i < TOTAL_APRENDICES; i++) {
    const nombre = alAzar(nombres);
    const apellido1 = alAzar(apellidos);
    const apellido2 = alAzar(apellidos);

    // Documento unico de 10 digitos
    let documento;
    do {
      documento = String(1000000000 + Math.floor(Math.random() * 900000000));
    } while (documentosUsados.has(documento));
    documentosUsados.add(documento);

    // Email unico usando el consecutivo i para no repetir
    const email = `${sinTildes(nombre)}.${sinTildes(apellido1)}${i}@sena.edu.co`;

    aprendices.push({
      documento,
      nombre: `${nombre} ${apellido1} ${apellido2}`,
      email,
      curso: alAzar(cursos)._id, // relacion con un curso real
    });
  }

  return aprendices;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Conectado a la base de datos");

    if (RESET) {
      await Aprendiz.deleteMany({}); // primero aprendices (dependen de curso)
      await Curso.deleteMany({});
      await Usuario.deleteMany({});
      console.log("Datos anteriores eliminados (--reset)");
    }

    // 1) Insertar cursos
    const cursosCreados = await Curso.insertMany(cursosData);
    console.log(`${cursosCreados.length} cursos insertados`);

    // 2) Generar e insertar aprendices enlazados a esos cursos
    const aprendices = generarAprendices(cursosCreados);
    const aprendicesCreados = await Aprendiz.insertMany(aprendices);
    console.log(`${aprendicesCreados.length} aprendices insertados`);

    // 3) Usuario administrador (con la contraseña hasheada, igual que lo haria
    //    el controlador de registro).
    const salt = bcrypt.genSaltSync(10);
    await Usuario.create({
      ...ADMIN,
      password: bcrypt.hashSync(ADMIN.password, salt),
    });
    console.log("1 usuario administrador insertado");

    console.log("\nSeed completado correctamente.");
    console.log("Inicia sesion en el frontend con:");
    console.log(`   email:      ${ADMIN.email}`);
    console.log(`   contraseña: ${ADMIN.password}`);
  } catch (error) {
    // Error tipico: E11000 -> el codigo o documento ya existe (corre con --reset)
    console.error("Error ejecutando el seed:", error.message);
    if (!RESET) {
      console.error("Sugerencia: si ya habias insertado datos, usa: node scripts/seed.js --reset");
    }
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seed();
