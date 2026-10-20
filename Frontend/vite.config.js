import { join } from "node:path";

import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { defineConfig } from "vite";

// Configuracion de Vite: aqui se registran los DOS plugins de compilacion.
// - vue(): compila los archivos .vue (SFC) y, con transformAssetUrls, convierte
//   los src/href de las plantillas en imports que Vite pueda empaquetar
//   (obligatorio para que Quasar resuelva sus propios assets).
// - quasar(): inyecta las variables Sass del tema en cada .sass de Quasar,
//   sin tener que recompilar todo el framework.
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({
      sassVariables: join(import.meta.dirname, "src/quasar-variables.sass"),
    }),
  ],

  server: {
    // Puerto fijo para que el .env y la documentacion coincidan siempre.
    port: 5173,
  },

  build: {
    // Advertencias de tamanio no frenan el build; sirven como guia.
    chunkSizeWarningLimit: 1200,
  },
});
