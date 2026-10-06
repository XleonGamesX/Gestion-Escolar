import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import dbConnection from "./database.js";
import { validateJWT } from "./middlewares/validateJWT.js";
import { routerUsuario } from "./routes/usuarios.routes.js";
import { routerCurso } from "./routes/cursos.routes.js";
import { routerAprendiz } from "./routes/aprendices.routes.js";

dotenv.config();

// En modulos ES no existe __dirname; se reconstruye a partir de import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Representa el servidor de la aplicacion.
 * @class
 */
class Server {
  /**
   * @constructor
   */
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4500;
    // Carpeta con el frontend ya compilado. El build del frontend se copia aqui
    // (ver "npm run deploy:backend" en el frontend) y este mismo servidor lo sirve.
    this.publicPath = path.join(__dirname, "public");
    this.middlewares();
    this.routes();
    this.conexionBd();
  }

  /**
   * Middlewares globales (se ejecutan en TODAS las peticiones).
   */
  middlewares() {
    this.app.use(express.json()); // permite leer req.body en formato JSON
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors()); // permite que el frontend (otro puerto) consuma la API
    this.app.use(morgan("dev")); // muestra en consola cada peticion que llega

    // Sirve el frontend ya compilado (index.html, /assets, favicon...). Si aun
    // no has copiado el build, la carpeta "public" no existe y esto simplemente
    // no sirve nada; util en desarrollo, cuando el frontend corre aparte con
    // "npm run dev" en el puerto 5173.
    this.app.use(express.static(this.publicPath));
  }

  /**
   * Registra las rutas de la aplicacion.
   * Cada modelo tiene su propio router montado bajo /api/<recurso>
   *
   * Aqui se ve de un vistazo QUE ESTA PROTEGIDO: el middleware validateJWT se
   * pone entre la URL y el router. Todo lo que pase por ahi necesita mandar la
   * cabecera x-token; si no, corta con un 401 y el controlador ni se entera.
   */
  routes() {
    // Publico: es por donde se consigue el token.
    this.app.use("/api/usuarios", routerUsuario);

    // Privado: requieren token.
    this.app.use("/api/cursos", validateJWT, routerCurso);
    this.app.use("/api/aprendices", validateJWT, routerAprendiz);

    // Ruta de cortesia para comprobar rapido que el servidor responde.
    // El nombre "/life" es un identificador y no se traduce; el mensaje si.
    this.app.use("/life", (req, res) => {
      res.send("El servidor esta funcionando");
    });

    // Una ruta de API (/api/...) que no coincide con las de arriba cae aqui y
    // responde 404 en JSON. Este msg lo muestra el frontend tal cual en un
    // Notify, por eso va en español igual que los demas mensajes del backend.
    this.app.use("/api/*", (req, res) => {
      res.status(404).json({ msg: "La ruta solicitada no existe" });
    });

    // Cualquier OTRA ruta devuelve el index.html del frontend, para que se abra
    // la aplicacion de Vue (asi tambien funciona entrar por una URL directa,
    // ademas del modo hash que usa el router). Si todavia no se ha copiado el
    // build, la carpeta public no existe: entonces se intenta servir la pagina
    // de error estatica (public/404.html) y, si tampoco existe, el 404 en JSON
    // de siempre.
    this.app.get("*", (req, res) => {
      const indexHtml = path.join(this.publicPath, "index.html");
      if (fs.existsSync(indexHtml)) {
        return res.sendFile(indexHtml);
      }

      const notFoundHtml = path.join(this.publicPath, "404.html");
      if (fs.existsSync(notFoundHtml)) {
        return res.status(404).sendFile(notFoundHtml);
      }

      res.status(404).json({ msg: "La ruta solicitada no existe" });
    });

    // Ultimo middleware de la cadena: solo se ejecuta si alguien llama a
    // next(error). Express reconoce una funcion de 4 argumentos COMO error
    // handler por su firma, no por el nombre.
    //
    // A las rutas /api/... les responde JSON (el frontend espera { msg }).
    // Al resto le sirve la pagina public/500.html, con su codigo de estado
    // correcto, para que el usuario vea algo entendible y no un stack trace.
    this.app.use((err, req, res, next) => {
      console.error(err);

      if (req.originalUrl.startsWith("/api")) {
        return res.status(500).json({ msg: "Error interno del servidor" });
      }

      const internalErrorHtml = path.join(this.publicPath, "500.html");
      if (fs.existsSync(internalErrorHtml)) {
        return res.status(500).sendFile(internalErrorHtml);
      }

      res.status(500).send("Error interno del servidor");
    });
  }

  /**
   * Conecta a la base de datos.
   */
  async conexionBd() {
    await dbConnection();
  }

  /**
   * Inicia el servidor.
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor en http://localhost:${this.port}`);
    });
  }
}

export default Server;
