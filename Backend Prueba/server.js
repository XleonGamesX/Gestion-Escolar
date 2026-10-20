
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4500;

    // Rutas posibles del frontend compilado.
    const frontendDistPath = path.resolve(
      __dirname,
      "..",
      "Frontend",
      "dist"
    );

    const backendPublicPath = path.join(__dirname, "public");

    // Prioriza public si contiene index.html; de lo contrario, usa dist.
    this.publicPath = fs.existsSync(
      path.join(backendPublicPath, "index.html")
    )
      ? backendPublicPath
      : frontendDistPath;

    this.middlewares();
    this.routes();
    this.conexionBd();
  }

  middlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(morgan("dev"));

    // Sirve los archivos estáticos del frontend.
    this.app.use(express.static(this.publicPath));
  }

  routes() {
    // Rutas públicas.
    this.app.use("/api/usuarios", routerUsuario);

    // Rutas protegidas mediante JWT.
    this.app.use("/api/cursos", validateJWT, routerCurso);
    this.app.use("/api/aprendices", validateJWT, routerAprendiz);

    // Comprobación del estado del servidor.
    this.app.use("/life", (req, res) => {
      res.send("El servidor esta funcionando");
    });

    // Respuesta para rutas de API inexistentes.
    this.app.use("/api/*path", (req, res) => {
      res.status(404).json({
        msg: "La ruta solicitada no existe",
      });
    });

    // Fallback para el frontend: compatible con Express 5.
    this.app.get("/{*path}", (req, res, next) => {
      const indexHtml = path.join(this.publicPath, "index.html");

      if (fs.existsSync(indexHtml)) {
        return res.sendFile(indexHtml, (err) => {
          if (err) next(err);
        });
      }

      const notFoundHtml = path.join(this.publicPath, "404.html");

      if (fs.existsSync(notFoundHtml)) {
        return res.status(404).sendFile(notFoundHtml, (err) => {
          if (err) next(err);
        });
      }

      res.status(404).json({
        msg: "La ruta solicitada no existe",
      });
    });

    // Manejo centralizado de errores.
    this.app.use((err, req, res, next) => {
      console.error(err);

      if (res.headersSent) {
        return next(err);
      }

      if (req.originalUrl.startsWith("/api")) {
        return res.status(500).json({
          msg: "Error interno del servidor",
        });
      }

      const internalErrorHtml = path.join(
        this.publicPath,
        "500.html"
      );

      if (fs.existsSync(internalErrorHtml)) {
        return res.status(500).sendFile(internalErrorHtml);
      }

      res.status(500).send("Error interno del servidor");
    });
  }

  async conexionBd() {
    await dbConnection();
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor en http://localhost:${this.port}`);
    });
  }
}

export default Server;
