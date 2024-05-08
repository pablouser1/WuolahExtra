import Api from "../helpers/Api";
import Misc from "../helpers/Misc";
import { HookAfter, HookBefore } from "../types/Hooks";
import Log from "./Log";
import handlePDF, { openBlob } from "../helpers/Cleaner";

export default class Hooks {
  static BEFORE: HookBefore[] = [
    {
      id: 'no-analytics',
      endpoint: /^\/v2\/events$/,
      func: Hooks.noAnalytics,
      cond: () => GM_config.get("no_analytics")
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
      cond: () => GM_config.get("clean_ui")
    },
    {
      id: 'folder-download',
      endpoint: /^\/v2\/group-downloads\/uploads/,
      func: Hooks.folderDownload,
      cond: () => GM_config.get("folder_download")
    }
  ]

  // -- Before -- //
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

  static folderDownload(res: Response) {
    const url = res.url
    const id = parseInt(url.substring(url.lastIndexOf('/') + 1));

    if (isNaN(id)) {
      Misc.log("Couldn't get folder ID!", Log.INFO);
      return;
    }

    Misc.log(`Starting folder download of ${id}`, Log.INFO);

    Api.folder(id).then(async (docs) => {
      let failed = false;
      let i = 0;
      while (!failed && i < docs.length) {
        const doc = docs[i];
        const url = await Api.docUrl(doc.id);

        if (url !== null) {
          let buf = await Api.docData(url);
          let options: BlobPropertyBag | undefined = undefined;

          if (doc.fileType === 'application/pdf') {
            buf = await handlePDF(buf);
            options = {
              type: "application/pdf"
            };
          }

          const blob = new Blob([buf], options);
          openBlob(blob, doc.name);
          i++;
        } else {
          failed = true;
          alert(`No se pudo descargar el archivo ${doc.name}, ¿quizás es un problema de captcha? Se ha interrumpido la descarga de la carpeta`);
        }
      }
    });
  }
}
