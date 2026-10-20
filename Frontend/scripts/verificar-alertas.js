import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "assets");
const cssFile = fs.readdirSync(dir).find((f) => f.endsWith(".css"));
const jsFile = fs.readdirSync(dir).find((f) => f.endsWith(".js"));
const css = fs.readFileSync(dir + "/" + cssFile, "utf8");
const js = fs.readFileSync(dir + "/" + jsFile, "utf8");

const checks = [
  ["CSS z-index del toast encima de Quasar", css.includes("swal2-toast-shown .swal2-container{z-index:7000")],
  ["CSS icono en blanco", /\[class\^=swal2-x-mark-line\][^{]*\{background-color:#fff!important/.test(css)],
  ["CSS boton primario de la confirmacion", css.includes("alerta-toast--confirmar .swal2-confirm{color:#1577ad")],
  ["CSS cancelar con filete blanco sobre azul", css.includes("alerta-toast--confirmar .swal2-cancel{color:#fff!important")],
  ["CSS botones del aviso mas chicos (34px)", css.includes("min-height:34px")],
  ["CSS ancho/titulo compacto", css.includes("swal2-toast .swal2-title{margin:.35em")],
  ["JS posicion abajo a la derecha", js.includes("bottom-end")],
  ["JS clase del aviso de exito", js.includes("alerta-toast--exito")],
  ["JS verde de exito", js.includes("#158047")],
  ["JS rojo de error", /#cf2f34/i.test(js)],
  ["JS ancho 340", /width:\s*340/.test(js)],
  ["JS sin llamadas a alertas.aviso(", !js.includes(".aviso(")],
];

let fallos = 0;
for (const [nombre, ok] of checks) {
  if (!ok) fallos++;
  console.log((ok ? "OK    " : "FALTA ") + "- " + nombre);
}
console.log(fallos === 0 ? "\nTODO OK" : "\n" + fallos + " SIN VERIFICAR");
