import Helpers from "../Helpers";
import DownloadBodyNew from "../types/DownloadBodyNew";
import DownloadBodyOld from "../types/DownloadBodyOld";
import { HookAfter, HookBefore } from "../types/Hooks";
import ClearMethods from "./ClearMethods";
import Log from "./Log";

export default class Hooks {
    static BEFORE: HookBefore[] = [
        {
            id: 'force-download',
            endpoint: /^\/v2\/download$/,
            func: Hooks.forceOldDownload
        }
    ]

    static AFTER: HookAfter[] = [
        {
            id: 'make-pro',
            endpoint: /^\/v2\/me$/,
            func: Hooks.makePro
        }
    ]

    // -- Before -- //
    static forceOldDownload(input: RequestInfo | URL, init?: RequestInit) {
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
            Helpers.log("Input on forceOldDownload is not URL", Log.DEBUG);
            return;
        }

        const oldBody: DownloadBodyNew = JSON.parse(init.body.toString())
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
    static makePro(res: Response) {
        if (res.ok) {
            Helpers.log('Making user client-side pro V2', Log.INFO)
            const json = () => res.clone().json().then(data => ({ ...data, isPro: true }));
            res.json = json;
        }
    }
}
