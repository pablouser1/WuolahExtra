import { monkeyWindow, unsafeWindow } from "$"
import ClearMethods from "../constants/ClearMethods"
import Log from "../constants/Log"
import FetchHook from "../interceptors/Fetch"
import objectURLWrapper from "../interceptors/ObjectURL"
import { cleanUI } from "../ui"
import Misc from "./Misc"

export default class Config {
  c!: GM_configStruct

  init(fetchHook: FetchHook) {
    this.c = monkeyWindow.GM_config({
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
        }
      },
      events: {
        init: () => {
          // Modo debug en fetch hook
          if (this.c.get("debug")) {
            fetchHook.setDebug(true)
          }

          // Ejecuta una vez tenga acceso a GM_config
          const clearMethod = this.c.get("clear_pdf").toString()

          // ObjectURL override para gulag y pdflib
          if (clearMethod === ClearMethods.PDFLIB || clearMethod === ClearMethods.GULAG) {
            Misc.log("Overriding createObjectURL", Log.DEBUG);
            unsafeWindow.URL.createObjectURL = objectURLWrapper
          }

          // Inyectar css
          if (this.c.get('clean_ui')) {
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
  }
}
