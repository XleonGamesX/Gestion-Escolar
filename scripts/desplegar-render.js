/**
 * Build de DESPLIEGUE para Render (y para probar el despliegue en local).
 *
 * Hace lo mismo que haría el servidor de despliegue, en este orden:
 *   1. npm install en "Backend Prueba"   -> dependencias de la API.
 *   2. npm install en "Frontend"         -> dependencias del frontend.
 *   3. vite build                        -> Frontend/dist.
 *   4. copia Frontend/dist a "Backend Prueba/public"
 *      (mismo trabajo que Frontend/scripts/deploy-backend.js).
 *
 * Se invoca desde la raiz con: npm run build
 *
 * IMPORTANTE: por que no se hizo con "--prefix" dentro del package.json
 * ---------------------------------------------------------------------
 * La forma "npm install --prefix <carpeta>" dentro de un script npm provoca
 * una recursión infinita en Windows (npm 10): el hijo vuelve a ejecutar el
 * script del padre, cada nivel agrega una carpeta al PATH y el proceso muere
 * con un "npm no se reconoce" imposible de leer. Para evitarlo, AQUI npm se
 * llama por su ruta absoluta (process.env.npm_execpath + process.execPath),
 * que funciona igual en Windows y en Linux (Render).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..");
const carpetaBackend = join(raiz, "Backend Prueba");
const carpetaFrontend = join(raiz, "Frontend");

/**
 * Ejecuta npm SIN depender del PATH del sistema.
 * Dentro de un script npm, process.env.npm_execpath apunta al archivo real de
 * npm (npm-cli.js); correrlo con node (process.execPath) es infalible.
 * @param {string[]} argumentos  argumentos de npm, por ejemplo ["install"].
 * @param {string}   cwd         carpeta donde corre npm.
 */
function npm(argumentos, cwd) {
  const ejecutable = process.env.npm_execpath;

  let comando = "npm";
  let lista = argumentos;

  if (ejecutable && ejecutable.endsWith(".js")) {
    // Caso normal (Windows y Linux): npm es un archivo .js y node lo corre.
    comando = process.execPath;
    lista = [ejecutable, ...argumentos];
  } else if (ejecutable) {
    // Casos raros: npm es un .cmd/.ps1 (solo Windows) -> necesita shell.
    lista = argumentos;
  }

  const resultado = spawnSync(comando, lista, {
    cwd,
    stdio: "inherit",
    shell: ejecutable ? !ejecutable.endsWith(".js") : false,
  });

  if (resultado.status !== 0) {
    console.error(`\nFallo npm ${argumentos.join(" ")} en: ${cwd}`);
    process.exit(resultado.status ?? 1);
  }
}

console.log("1/4 Instalando dependencias del backend...");
npm(["install"], carpetaBackend);

console.log("\n2/4 Instalando dependencias del frontend...");
npm(["install"], carpetaFrontend);

console.log("\n3/4 Compilando el frontend (vite build -> Frontend/dist)...");
npm(["run", "build"], carpetaFrontend);

console.log("\n4/4 Copiando Frontend/dist a Backend Prueba/public...");
// deploy-backend.js calcula las rutas a partir de su propio archivo, asi que
// se puede lanzar desde cualquier carpeta.
const copiador = spawnSync(
  process.execPath,
  [join(carpetaFrontend, "scripts", "deploy-backend.js")],
  { stdio: "inherit" }
);

if (copiador.status !== 0) {
  console.error("No se pudo copiar el build a Backend Prueba/public");
  process.exit(copiador.status ?? 1);
}

console.log("\n✅ Listo. En Render, el paso siguiente es: npm start");
