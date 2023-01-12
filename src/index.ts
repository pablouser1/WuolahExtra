/// <reference path="types/GM_Config.ts" />
/// <reference path="types/tampermonkey-reference.d.ts" />

import FetchRewriter from './Fetch'
import Helpers from './Helpers'

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
            label: 'Enable debug mode',
            default: false
        }
    }
})

Helpers.log('STARTING')
const { fetch: origFetch } = unsafeWindow

const rewrite = new FetchRewriter()

// Fetch override
unsafeWindow.fetch = async (...args): Promise<Response> => {
    let [ input, init ] = args;
    rewrite.before(input, init)
    const response = await origFetch(input, init)
    rewrite.after(response)
    return response
}

// URL.createObjectURL override
const { createObjectURL: origcreateObjectURL } = unsafeWindow.URL

// TODO: Limpiar completamente el Blob
unsafeWindow.URL.createObjectURL = (obj: Blob | MediaSource): string => {
    return origcreateObjectURL(obj)
}

// Adding config button
window.addEventListener('load', () => {
    const config = document.createElement('button')
    config.setAttribute('style', 'position: absolute; top: 150px; right: 10px;')
    config.onclick = () => GM_config.open()
    config.innerText = 'WuolahExtra Config'
    document.body.appendChild(config)
})
