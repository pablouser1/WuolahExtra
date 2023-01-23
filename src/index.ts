/// <reference path="types/GM_Config.ts" />
/// <reference path="types/tampermonkey-reference.d.ts" />

import Log from './constants/Log'
import fetchWrapper from './interceptors/Fetch'
import objectURLWrapper from './interceptors/ObjectURL'
import Helpers from './Helpers'

Helpers.log('STARTING', Log.INFO)

// Skip annoying ads when refreshing
if (window.location.pathname === '/refresh') {
    window.location.replace('https://wuolah.com/')
}

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
        }
    }
})

// Fetch override
unsafeWindow.fetch = fetchWrapper

// ObjectURL override
if (GM_config.get('clear')) {
    unsafeWindow.URL.createObjectURL = objectURLWrapper
}

// Adding config button
window.addEventListener('load', () => {
    const config = document.createElement('button')
    config.setAttribute('style', 'position: absolute; top: 150px; right: 10px;')
    config.onclick = () => GM_config.open()
    config.innerText = 'WuolahExtra Config'
    document.body.appendChild(config)
})
