import Api from "../helpers/Api";
import Misc from "../helpers/Misc";
import { HookAfter, HookBefore } from "../types/Hooks";
import Log from "./Log";
import handlePDF, { openBlob } from "../helpers/Cleaner";

/**
 * Hooks de Fetch
 */
export default class Hooks {
  /**
   * Hooks que se ejecutan antes de enviar una solicitud
   */
  static BEFORE: HookBefore[] = [
    {
      id: "no-analytics",
      endpoint: /^\/v2\/events$/,
      func: Hooks.noAnalytics,
      cond: () => GM_config.get("no_analytics"),
    },
  ];

  /**
   * Hooks que se ejecutan después de enviar una solicitud
   */
  static AFTER: HookAfter[] = [
    {
      id: "make-pro",
      endpoint: /^\/v2\/me$/,
      func: Hooks.makePro,
    },
    {
      id: "no-ui-ads",
      endpoint: /^\/v2\/a-d-s$/,
      func: Hooks.noUiAds,
      cond: () => GM_config.get("clean_ui"),
    },
    {
      id: "folder-download",
      endpoint: /^\/v2\/group-downloads\/uploads/,
      func: Hooks.folderDownload,
      cond: () => GM_config.get("folder_download"),
    },
  ];

  // -- Before -- //
  /**
   * Eliminar analíticas de Wuolah
   */
  static noAnalytics(_input: RequestInfo | URL, init?: RequestInit) {
    if (init) {
      Misc.log("Eliminando eventos", Log.INFO);
      init.body = JSON.stringify({
        events: [],
      });
    }
  }

  // -- After -- //
  /**
   * Reemplaza solicitud de /me y hacer al usuario pro
   */
  static makePro(res: Response) {
    if (res.ok) {
      Misc.log("Haciendo usuario pro client-side", Log.INFO);
      const json = () =>
        res
          .clone()
          .json()
          .then((d) => ({ ...d, isPro: true }));
      res.json = json;
    }
  }

  /**
   * Elimina anuncios de la UI
   */
  static noUiAds(res: Response) {
    if (res.ok) {
      Misc.log("Eliminando ui ads", Log.INFO);

      const json = async () => {
        return { items: [] };
      };

      res.json = json;
    }
  }

  /**
   * Descarga carpetas
   * @todo Gestionar captchas
   */
  static folderDownload(res: Response) {
    var zip2 = new JSZip();
    const url = res.url;
    const id = parseInt(url.substring(url.lastIndexOf("/") + 1));

    if (isNaN(id)) {
      Misc.log("¡Error al obtener id de la carpeta!", Log.INFO);
      return;
    }

    Misc.log(`Descargando carpeta ${id}`, Log.INFO);

    Api.folder(id).then(async (docs) => {
      let failed = false;
      let i = 0;
      while (!failed && i < docs.length) {
        const doc = docs[i];
        const url = await Api.docUrl(doc.id);

        if (url !== null) {
          let buf = await Api.docData(url);
          let options: BlobPropertyBag | undefined = undefined;

          if (doc.fileType === "application/pdf") {
            buf = await handlePDF(buf);
            options = {
              type: "application/pdf",
            };
          }

          const blob = new Blob([buf], options);
          zip2.file(await title, buf, {binary: true})
          i++;
        } else {
          failed = true;
          alert(`No se pudo descargar el archivo ${doc.name}, ¿quizás es un problema de captcha? Se ha interrumpido la descarga de la carpeta`);
        }
      }
      const a = document.createElement('a');
            a.setAttribute("target", "_blank");
            a.click();
            a.href = "data:application/zip;base64," + zip2.generate();
            a.download = id;
            a.click();
            a.remove();
    });
  }
}
