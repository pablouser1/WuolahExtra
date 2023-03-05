/// <reference path="types/GM_Config.ts" />
/// <reference path="types/tampermonkey-reference.d.ts" />

import Log from './constants/Log'
import fetchWrapper from './interceptors/Fetch'
import objectURLWrapper from './interceptors/ObjectURL'
import Helpers from './Helpers'

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
        }
    }
})

// Fetch override
unsafeWindow.fetch = fetchWrapper

// ObjectURL override
if (GM_config.get('clear')) {
    unsafeWindow.URL.createObjectURL = objectURLWrapper
}

const addSettings = () => {
    const config = document.createElement('button')
    config.setAttribute('style', 'position: absolute; top: 150px; right: 10px;')
    config.onclick = () => GM_config.open()
    config.innerText = 'WuolahExtra Config'
    document.body.appendChild(config)
}

const addComunities = () => {
    const a = document.createElement('a')
    a.setAttribute('style', 'position: absolute; top: 200px; right: 10px;')
    a.href = "https://wuolah.com/settings/my-communities"
    a.innerText = 'Elegir otra carrera'
    document.body.appendChild(a)
}

// Adding config button
window.addEventListener('DOMContentLoaded', () => {
    addSettings()
    addComunities()
    // Skip annoying ads when refreshing
    if (window.location.pathname === '/refresh') {
        window.location.href = 'https://wuolah.com/'
    }
})
