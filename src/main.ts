import Hooks from "./constants/Hooks";
import Log from "./constants/Log";
import Misc from "./helpers/Misc";
import FetchWrapper from "./wrappers/Fetch";
import { addOptions, cleanUI } from "./ui";
import ClearMethods from "./constants/ClearMethods";
import objectURLWrapper from "./wrappers/ObjectURL";

// fix issue with unsafeWindow.URL
declare const unsafeWindow: Window & typeof globalThis;

Misc.log("STARTING", Log.INFO);

// Setup fetch wrapper
const fetchWrapper = new FetchWrapper();
fetchWrapper.addHooks({
  before: Hooks.BEFORE,
  after: Hooks.AFTER,
});

// Iniciar config de userscript
GM_config.init({
  id: "wuolahextra",
  fields: {
    debug: {
      type: "checkbox",
      label: "Modo debugging",
      default: false,
    },
    clear_pdf: {
      type: "select",
      label: "Método de limpieza de PDF",
      options: Object.values(ClearMethods),
      default: ClearMethods.GULAG,
    },
    clean_ui: {
      type: "checkbox",
      label: "Limpia distracciones en la interfaz",
      default: true,
    },
    no_analytics: {
      type: "checkbox",
      label: "Desactivar analíticas",
      default: true,
    },
    folder_download: {
      type: "checkbox",
      label: "[EXPERIMENTAL] Descargar carpeta",
      title: "¡Esta función aún está en desarrollo!",
      default: false,
    },
  },
  events: {
    init: () => {
      // Modo debug en fetch hook
      if (GM_config.get("debug")) {
        fetchWrapper.setDebug(true);
      }

      const clearMethod = GM_config.get("clear_pdf").toString();

      // ObjectURL override para gulag y pdflib
      if (clearMethod === ClearMethods.PDFLIB || clearMethod === ClearMethods.GULAG) {
        Misc.log("Overriding createObjectURL", Log.DEBUG);
        unsafeWindow.URL.createObjectURL = objectURLWrapper;
      }

      // Inyectar css
      if (GM_config.get("clean_ui")) {
        Misc.log("Injecting CSS", Log.DEBUG);
        cleanUI();
      }

      // Init wasm para Gulag
      if (clearMethod === ClearMethods.GULAG) {
        Misc.initGulag();
      }
    },
    save: () => {
      const ok = confirm("Los cambios se han guardado, ¿quieres refrescar la página para aplicar los cambios?");
      if (ok) {
        window.location.reload();
      }
    },
  },
});

// Monkey-patching fetch
unsafeWindow.fetch = (...args) => fetchWrapper.entrypoint(...args);

// Monkey menu
addOptions();
