import { defineConfig } from 'vite';
import monkey, { cdn, util } from 'vite-plugin-monkey';

const NAME = "WuolahExtra"
const LATEST_URL = "https://github.com/pablouser1/WuolahExtra/releases/latest/download/WuolahExtra.user.js"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Avoid transpiling
    target: 'esnext'
  },
  plugins: [
    // -- Monkey -- //
    monkey({
      entry: 'src/main.ts',
      build: {
        fileName: `${NAME}.user.js`,
        externalGlobals: {
          'pdf-lib': cdn.unpkg('PDFLib', 'dist/pdf-lib.min.js')
        }
      },
      userscript: {
        name: NAME,
        namespace: 'Violentmonkey Scripts',
        match: ['https://wuolah.com/*'],
        grant: [
          // Soporte para GM_config, el tree-shake no funciona con el script
          "GM.getValue",
          "GM.setValue",
          "GM_getValue",
          "GM_setValue"
        ],
        require: [
          // GM_config
          'https://openuserjs.org/src/libs/sizzle/GM_config.js',
          util.dataUrl('window.GM_config=GM_config'),
        ],
        resource: {
          // Gulag WASM build
          'gulag-wasm': 'https://cdn.jsdelivr.net/npm/gulagcleaner_wasm@0.12.1/gulagcleaner_wasm_bg.wasm'
        },
        downloadURL: LATEST_URL,
        updateURL: LATEST_URL
      },
    }),
  ],
});
