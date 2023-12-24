import ClearMethods from '../constants/ClearMethods'
import Log from '../constants/Log'
import Helpers from '../Helpers'
import type DownloadBodyNew from '../types/DownloadBodyNew'
import type DownloadBodyOld from '../types/DownloadBodyOld'

class FetchRewriter {
    private beforeActions = [
        {
            'endpoint':  /^\/v2\/download$/,
            'action': this.forceOldDownload
        }
    ]

    private afterActions = [
        {
            'endpoint': /^\/v2\/me$/,
            'action': this.makePro
        }
    ]

    before (input: RequestInfo | URL, init: RequestInit | undefined) {
        const path = Helpers.getPath(input.toString())
        const index = this.beforeActions.findIndex(item => item.endpoint.test(path))
        if (index !== -1) {
            this.beforeActions[index].action(input, init)
        }
    }

    after (res: Response) {
        const path = Helpers.getPath(res.url)
        const index = this.afterActions.findIndex(item => item.endpoint.test(path))
        if (index !== -1) {
            this.afterActions[index].action(res)
        }
    }

    // -- Before -- //
    forceOldDownload (input: RequestInfo | URL, init: RequestInit | undefined) {
        // Activar sólo si estamos usando el método de limpieza PARAMS
        if (GM_config.get("clear_pdf").toString() !== ClearMethods.PARAMS) {
            Helpers.log("Not params, ignore force old download endpoint", Log.DEBUG);
            return;
        }
    
        Helpers.log('Redirecting download to old endpoint', Log.INFO)

        // No hay cuerpo
        if (!(init && init.body)) {
            Helpers.log("No body on forceOldDownload", Log.DEBUG);
            return;
        }

        // La url es de un tipo inválido
        if (!(input instanceof URL)) {
            Helpers.log("Input on forceOldDownload is not MutableStr", Log.DEBUG);
            return;
        }

        const oldBody: DownloadBodyNew = JSON.parse(init.body.toString())
        Helpers.log('Old Body: ' + JSON.stringify(oldBody), Log.DEBUG)

        input.pathname = `/v2/documents/${oldBody.fileId}/download`

        const newBody: DownloadBodyOld = {
            "source": "W3",
            "premium": 1,
            "blocked": true,
            "ubication17ExpectedPubs": 0,
            "ubication1ExpectedPubs": 0,
            "ubication2ExpectedPubs": 0,
            "ubication3ExpectedPubs": 0,
            "ubication17RequestedPubs": 0,
            "ubication1RequestedPubs": 0,
            "ubication2RequestedPubs": 0,
            "ubication3RequestedPubs": 0
        }

        // Overwrite body and force no ads
        init.body = JSON.stringify(newBody)
    }

    // -- After -- //
    makePro(res: Response) {
        if (res.ok) {
            Helpers.log('Making user client-side pro V2', Log.INFO)
            const json = () => res.clone().json().then(data => ({ ...data, isPro: true }));
            res.json = json;
        }
    }
}

const { fetch: origFetch } = unsafeWindow

const rewrite = new FetchRewriter()
const fetchWrapper = async (input: RequestInfo | URL, init: RequestInit | undefined): Promise<Response> => {
    let newInput: RequestInfo | URL = input;

    // Allow to rewrite parameter
    if (typeof input === "string" && input.includes("/v2/download")) {
        newInput = new URL(input);
    }

    rewrite.before(newInput, init)
    const response = await origFetch(newInput, init)
    rewrite.after(response)
    return response
}

export default fetchWrapper
