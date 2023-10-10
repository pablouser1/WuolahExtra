/// <reference path="types/GM_Config.ts" />
/// <reference path="types/tampermonkey-reference.d.ts" />

import Log from './constants/Log'
import fetchWrapper from './interceptors/Fetch'
import objectURLWrapper from './interceptors/ObjectURL'
import Helpers from './Helpers'
import { addOptions, cleanUI } from './ui'

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
        clear: {
            type: 'checkbox',
            label: 'Limpiar PDF al descargarlo (WIP)',
            default: true
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
            // ObjectURL override
            if (GM_config.get('clear')) {
                Helpers.log("Overriding createObjectURL", Log.DEBUG);
                unsafeWindow.URL.createObjectURL = objectURLWrapper
            }

            if (GM_config.get('clean_ui')) {
                Helpers.log("Injecting CSS", Log.DEBUG);
                cleanUI()
            }
        }
    }
})

// Fetch override
unsafeWindow.fetch = fetchWrapper

// Add menu
addOptions()
