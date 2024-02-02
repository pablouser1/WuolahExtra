import c from "../config";
import Misc from "../helpers/Misc";
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
      func: Hooks.forceOldDownload,
      cond: () => c().get("clear_pdf").toString() === ClearMethods.PARAMS
    },
    {
      id: 'no-analytics',
      endpoint: /^\/v2\/events$/,
      func: Hooks.noAnalytics,
      cond: () => c().get("no_analytics")
    }
  ]

  static AFTER: HookAfter[] = [
    {
      id: 'make-pro',
      endpoint: /^\/v2\/me$/,
      func: Hooks.makePro
    },
    {
      id: 'no-ui-ads',
      endpoint: /^\/v2\/a-d-s$/,
      func: Hooks.noUiAds,
      cond: () => c().get("clean_ui")
    }
  ]

  // -- Before -- //
  static forceOldDownload(input: RequestInfo | URL, init?: RequestInit) {
    Misc.log('Redirecting download to old endpoint', Log.INFO)

    // No hay cuerpo
    if (!(init && init.body)) {
      Misc.log("No body on forceOldDownload", Log.DEBUG);
      return;
    }

    // La url es de un tipo inválido
    if (!(input instanceof URL)) {
      Misc.log("Input on forceOldDownload is not URL", Log.DEBUG);
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

  static noAnalytics(_input: RequestInfo | URL, init?: RequestInit) {
    if (init) {
      Misc.log('Removing events', Log.INFO)
      init.body = JSON.stringify({
        events: []
      })
    }
  }

  // -- After -- //
  static makePro(res: Response) {
    if (res.ok) {
      Misc.log('Making user client-side pro V2', Log.INFO)
      const json = () => res.clone().json().then(d => ({ ...d, isPro: true }));
      res.json = json;
    }
  }

  static noUiAds(res: Response) {
    if (res.ok) {
      Misc.log('Wiping ui ads array', Log.INFO)

      const json = async () => {
        return { items: [] }
      }

      res.json = json
    }
  }
}
