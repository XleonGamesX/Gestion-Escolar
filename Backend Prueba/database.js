/**
 * Establece la conexion a MongoDB usando la variable de entorno MONGO_URL.
 * Si falla, reintenta cada 5 segundos.
 * @async
 * @function dbConnection
 * @returns {Promise<void>}
 */
import dns from "dns";
import path from "path";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

// En modulos ES no existe __dirname; se reconstruye a partir de import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ruta absoluta al .env del backend: el directorio de trabajo depende de como
// se arranque el proceso (en Render puede ser la raiz del repo). dotenv no
// pisa variables ya definidas, asi que MONGO_URL del dashboard de Render (si
// existe) tiene prioridad sobre este archivo.
dotenv.config({ path: path.join(__dirname, ".env") });

// Las cadenas "mongodb+srv://" hacen una consulta DNS especial (tipo SRV). En
// algunas redes el DNS local la rechaza (error "querySrv ECONNREFUSED") y la
// conexion nunca se logra, aunque en MongoDB Compass funcione. Forzar un DNS
// publico (Google y Cloudflare) resuelve ese caso y no afecta a otras redes.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Conectado a la base de datos");
  } catch(e) {
    console.log("Error conectando a la base de datos, reintentando en 5s... "+e);
    setTimeout(() => {
      dbConnection();
    }, 5000);
  }
};

export default dbConnection;
