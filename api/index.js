/**
 * Punto de entrada de la API para VERCEL.
 *
 * En local esto NO se usa: el servidor se levanta con `npm run dev`, que
 * ejecuta Backend Prueba/app.js y llama a server.listen().
 *
 * En Vercel este archivo se convierte en UNA sola función serverless y
 * exporta la MISMA instancia de Express que usa el servidor local, asi
 * que las rutas, los middlewares y la validacion de JWT son exactamente
 * los mismos. vercel.json redirige /api/* hacia aqui.
 *
 * Ojo: no se llama a app.listen() (Vercel lo prohibe) y no se toca
 * express.static: en Vercel los archivos estaticos los sirve el CDN.
 */
import Server from "../Backend Prueba/server.js";

const server = new Server();

export default server.app;
