/// <reference path="types/GM_Config.ts" />
/// <reference path="types/tampermonkey-reference.d.ts" />

import Log from './constants/Log'
import fetchWrapper from './interceptors/Fetch'
import objectURLWrapper from './interceptors/ObjectURL'
import Helpers from './Helpers'
import { addOptions, cleanUI } from './ui'
import ClearMethods from './constants/ClearMethods'

Helpers.log('STARTING', Log.INFO)

// GM Config
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
            options: ["none", "params", "gulag", "pdflib"],
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
            // Ejecuta una vez tenga acceso a GM_config
            const clearMethod = GM_config.get("clear_pdf").toString()

            // ObjectURL override para gulag y pdflib
            if (clearMethod === ClearMethods.PDFLIB || clearMethod === ClearMethods.GULAG) {
                Helpers.log("Overriding createObjectURL", Log.DEBUG);
                unsafeWindow.URL.createObjectURL = objectURLWrapper
            }

            // Inyectar css
            if (GM_config.get('clean_ui')) {
                Helpers.log("Injecting CSS", Log.DEBUG);
                cleanUI()
            }

            // Init wasm para Gulag
            if (clearMethod === ClearMethods.GULAG) {
                Helpers.initGulag()
            }
        },
        save: () => {
            alert("Recargando la página para aplicar los cambios")
            window.location.reload()
        }
    }
})

// Fetch override
unsafeWindow.fetch = fetchWrapper

// Add menu
addOptions()
