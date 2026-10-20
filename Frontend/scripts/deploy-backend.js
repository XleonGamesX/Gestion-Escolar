/**
 * Copia el build del frontend (dist/) a la carpeta pública del backend
 * (../Backend Prueba/public), para que Express sirva la aplicación compilada.
 *
 * Se ejecuta con: npm run deploy:backend
 * (vite build && node scripts/deploy-backend.js)
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const origen = join(aqui, "..", "dist");
const destino = join(aqui, "..", "..", "Backend Prueba", "public");

if (!existsSync(origen)) {
  console.error("No se encontró la carpeta dist/. Ejecuta primero: npm run build");
  process.exit(1);
}

// Se reemplaza por completo para no dejar archivos obsoletos de builds viejos.
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });
cpSync(origen, destino, { recursive: true });

console.log("✅ Frontend compilado copiado a:", destino);
console.log("   Reinicia el backend para que lo sirva en http://localhost:4500");
