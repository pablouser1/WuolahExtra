import Hooks from "./constants/Hooks";
import Log from "./constants/Log";
import Misc from "./helpers/Misc";
import FetchHook from "./interceptors/Fetch";
import { addOptions, cleanUI } from "./ui";
import ClearMethods from "./constants/ClearMethods";
import objectURLWrapper from "./interceptors/ObjectURL";

// fix issue with unsafeWindow.URL
declare const unsafeWindow: Window & typeof globalThis;

Misc.log('STARTING', Log.INFO)

// Fetch hooking
const fetchHook = new FetchHook()
fetchHook.addHooks({
  before: Hooks.BEFORE,
  after: Hooks.AFTER
})

GM_config.init({
  id: 'wuolahextra',
  fields: {
    debug: {
      type: 'checkbox',
      label: 'Modo debugging',
      default: false
    },
    clear_pdf: {
      type: 'select',
      label: 'Método de limpieza de PDF',
      options: Object.values(ClearMethods),
      default: ClearMethods.GULAG
    },
    clean_ui: {
      type: 'checkbox',
      label: 'Limpia distracciones en la interfaz',
      default: false
    },
    no_analytics: {
      type: 'checkbox',
      label: 'Desactivar analíticas',
      default: true
    }
  },
  events: {
    init: () => {
      // Modo debug en fetch hook
      if (GM_config.get("debug")) {
        fetchHook.setDebug(true)
      }

      // Ejecuta una vez tenga acceso a GM_config
      const clearMethod = GM_config.get("clear_pdf").toString()

      // ObjectURL override para gulag y pdflib
      if (clearMethod === ClearMethods.PDFLIB || clearMethod === ClearMethods.GULAG) {
        Misc.log("Overriding createObjectURL", Log.DEBUG);
        unsafeWindow.URL.createObjectURL = objectURLWrapper
      }

      // Inyectar css
      if (GM_config.get('clean_ui')) {
        Misc.log("Injecting CSS", Log.DEBUG);
        cleanUI()
      }

      // Init wasm para Gulag
      if (clearMethod === ClearMethods.GULAG) {
        Misc.initGulag()
      }
    },
    save: () => {
      const ok = confirm("Los cambios se han guardado, ¿quieres refrescar la página para aplicar los cambios?")
      if (ok) {
        window.location.reload()
      }
    }
  }
})

// Monkey-patching fetch
unsafeWindow.fetch = (...args) => fetchHook.entrypoint(...args)

// Add menu
addOptions()
