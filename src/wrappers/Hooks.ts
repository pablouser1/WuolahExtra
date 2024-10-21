import Api from "../helpers/Api";
import Misc from "../helpers/Misc";
import { HookAfter, HookBefore } from "../types/Hooks";
import Log from "../constants/Log";
import handlePDF from "../helpers/Cleaner";
import JSZip from "jszip";

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
      id: "force-dark",
      endpoint: /^\/v2\/user-preferences\/me$/,
      func: Hooks.forceDark,
      cond: () => true,
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
    {
      id: "clean-aside",
      endpoint: /\/v2\/rankings\/users/,
      func: Hooks.hideAsideOnDownload,
      cond: () => GM_config.get("f"),
    },
    {
      id: "page",
      endpoint: /^\/v2\/.*/,
      func: Hooks.onPageReload,
      cond: () => true,
    }

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
   * Reemplaza solicitud de /me
   *
   * Hace usuario PRO y le da suscripción PRO+
   */
  static makePro(res: Response) {
    if (res.ok) {
      Misc.log("Haciendo usuario pro client-side", Log.INFO);
      const json = () =>
        res
          .clone()
          .json()
          .then((d) => ({
            ...d,
            isPro: true,
            subscriptionId: "prod_OiP9d4lmwvm0Ba",
            subscriptionTier: "tier_3",
            verifiedSubscriptionTier: true,
          }));
      res.json = json;
    }
  }

  /**
   * Fuerza modo oscuro en el nuevo frontend de Wuolah
   */
  static forceDark(res: Response) {
    if (res.ok) {
      Misc.log("Forzando tema oscuro", Log.INFO);
      const json = () =>
        res
          .clone()
          .json()
          .then((d) => ({
            ...d,
            item: {
              theme: "wuolah-theme-dark",
            },
          }));
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
    const zip = new JSZip();
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

          if (doc.fileType === "application/pdf") {
            buf = await handlePDF(buf);
          }

          zip.file(doc.name, buf, { binary: true });
          i++;
        } else {
          failed = true;
          alert(
            `No se pudo descargar el archivo ${doc.name}, ¿quizás es un problema de captcha? Se ha interrumpido la descarga de la carpeta`
          );
        }
      }

      if (!failed) {
        zip
          .generateAsync({ type: "base64" })
          .then((bs64) => {
            const a = document.createElement("a");
            a.href = "data:application/zip;base64," + bs64;
            a.setAttribute("download", `${id}.zip`);
            a.click();
            a.remove();
          })
          .catch((err) => {
            Misc.log(err, Log.ERROR);
          });
      }
    });
  }

  /**
   * Elimina la barra lateral
   *
   */

  static hideAsideOnDownload(res: Response) {
    hideAside();
  }
  /**
     * Limpia la Barra de Navegación
     *
     */


  static onPageReload(res: Response) {
    if (GM_config.get("clean_navbar"))
      cleanNavbar();
    if (GM_config.get("hide_feed"))
      hideFeed()

    if (GM_config.get("hide_aside"))
      hideAside()
  }


}


function cleanNavbar() {
  hideElementsWithParent("DesktopNavbarAuth_userInfo__SYFUt", [2, 4]);
  hideElementsWithParent(
    "DesktopNavbarAuth_linksContainer__PHnq0",
    [3, 4, 5, 6, 7, 8, 9]
  );
}

function hideFeed() {


  const checker = /https:\/\/wuolah.com\/apuntes\/.*/
  const currentUrl = window.location.href;

  if (!checker.test(currentUrl)) {
    removeElementsByClass("Body_title__MK9Zk");
    removeElementsByClass("HomePage_postTitle__NU4Sf");
    removeElementsByClass("infinite-scroll-component__outerdiv");
  }

}

function hideAside() {
  removeElementsByClass("SupportingPaneLayout_supportingPane__hR__U");
  addCssByClass("SupportingPaneLayout_container__wvAa5", {
    display: "block",
    width: "750px",
  });
  addCssByClass("SupportingPaneLayout_main__nlLZa", {
    width: "100%",
  });
}
function removeElementsByClass(className: string) {
  const elements = document.querySelectorAll(`.${className}`);

  elements.forEach((element) => {
    element.remove();
  });
}

function hideElementsWithParent(parentClassName: string, indexes: number[]) {
  function hideElementsWithParent(parentClassName: string, indexes: number[]) {
    const parent = document.querySelector(`.${parentClassName}`);
    const children = indexes.map((index) => parent?.children[index]);
    children.forEach((child) => {
      if (child)
        (child as HTMLElement).style["display"] = "none"
      if (child)
        (child as HTMLElement).style["display"] = "none"
    });
  }
  function addCssByClass(
    className: string,
    styles: { [key: string]: string }
  ): void {
    const elements = document.querySelectorAll(`.${className}`);

    if (elements.length > 0) {
      elements.forEach((element) => {
        for (const property in styles) {
          (element as HTMLElement).style[property as any] = styles[property];
        }
      });
    } else {
      console.error(`No elements found with selector "${className}".`);
    }
  }
