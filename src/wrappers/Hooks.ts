import Api from "../helpers/Api";
import Misc from "../helpers/Misc";
import { HookAfter, HookBefore } from "../types/Hooks";
import Log from "../constants/Log";
import handlePDF from "../helpers/Cleaner";
import JSZip from "jszip";
import { ProgressUI } from "../ui";

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
      cond: () => GM_config.get("force_dark"),
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
          .then((d) => ({ ...d, isPro: true, subscriptionId: "prod_OiP9d4lmwvm0Ba", subscriptionTier: "tier_3", verifiedSubscriptionTier: true }));
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
            ...d, item: {
              theme: {
                id: "wuolah-theme-dark",
                properties: {
                  colorSchemeAlias: "wuolah-color-scheme-dark",
                  previewUrl: "https://cdn.wuolahservices.com/features/themes/default/preview.png"
                }
              }
            }
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

    const progress = new ProgressUI(`Descargando carpeta ${id}`);
    progress.setStatus("Obteniendo información de la carpeta…");

    if (isNaN(id)) {
      Misc.log("¡Error al obtener id de la carpeta!", Log.INFO);
      progress.setError("Error: no se pudo obtener el ID de la carpeta");
      return;
    }

    Misc.log(`Descargando carpeta ${id}`, Log.INFO);

    Api.uploadInfo(id).then((info) => {
      const sanitizeFilename = (name: string): string => {
        return name.replace(/[\\/:*?\"<>|]+/g, "_").trim();
      };

      const folderName = sanitizeFilename(info?.name || id.toString()) || id.toString();
      progress.setStatus("Listando documentos…");

      Api.folder(id).then(async (docs) => {
        progress.setTotal(docs.length);
        progress.setProgress(0, docs.length);

        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

        const getCaptchaCounter = async (): Promise<number | null> => {
          try {
            const me = await Api.me();
            return typeof me.captchaCounter === "number" ? me.captchaCounter : null;
          } catch {
            return null;
          }
        };

        const waitForCaptchaCounterPositive = async (): Promise<boolean> => {
          let lastShown: number | null = null;
          while (!progress.isCancelled()) {
            const current = await getCaptchaCounter();
            if (current !== null && current !== lastShown) {
              lastShown = current;
              progress.setError(
                `Esperando captcha…\n` +
                `Descargas disponibles: ${current}\n` +
                `Cuando completes el captcha en Wuolah, el script seguirá automáticamente.`
              );
            }

            if (current !== null && current > 0) {
              return true;
            }
            await sleep(1000);
          }
          return false;
        };

        let captchaExplained = false;

        try {
          progress.setStatus("Comprobando captchaCounter…");
          const me = await Api.me();
          const counter = typeof me.captchaCounter === "number" ? me.captchaCounter : null;
          if (counter !== null && docs.length > counter) {
            alert(
              `Aviso: esta carpeta tiene ${docs.length} archivos, pero ahora mismo solo puedes descargar ${counter} archivos seguidos antes de que Wuolah te pida una verificación (captcha).\n\n` +
              `La descarga se parará a la mitad. Cuando ocurra, el script te indicará qué hacer para continuar.`
            );
          }
        } catch (e) {
          Misc.log(`No se pudo comprobar captchaCounter: ${e}`, Log.DEBUG);
        }

        let isPaused = false;
        let availableTokens: number | null = await getCaptchaCounter();
        let pausePromise: Promise<boolean> | null = null;
        let pauseResolver: ((v: boolean) => void) | null = null;

        let completed = 0;
        let failed = false;
        let fatalError: string | null = null;

        const setStatusSafe = (text: string) => {
          if (!isPaused && !failed && !progress.isCancelled()) {
            progress.setStatus(text);
          }
        };

        const refreshTokens = async () => {
          const t = await getCaptchaCounter();
          availableTokens = t;
          return t;
        };

        const waitIfPaused = async (): Promise<boolean> => {
          if (isPaused && pausePromise) {
            return pausePromise;
          }
          return true;
        };

        const triggerPause = async (docName?: string): Promise<boolean> => {
          if (isPaused) return waitIfPaused();

          isPaused = true;
          pausePromise = new Promise<boolean>((resolve) => {
            pauseResolver = resolve;
          });

          await refreshTokens();

          if (!captchaExplained) {
            const ok = confirm(
              `No se pudo continuar descargando${docName ? ` (${docName})` : ""} por culpa de un captcha.\n\n` +
              `No cierres esta ventana!!\n\n` +
              `Para seguir con la descarga de la carpeta:\n` +
              `1) Descarga cualquier archivo individual desde la web de Wuolah para que aparezca el captcha (vale de esta misma carpeta)\n` +
              `2) Resuélvelo\n` +
              `3) El script continuará automáticamente\n\n` +
              `Pulsa Cancelar para cancelar la descarga de la carpeta.`
            );

            if (!ok) {
              isPaused = false;
              pauseResolver?.(false);
              return false;
            }
            captchaExplained = true;
          }

          progress.setError(
            `Esperando captcha${docName ? `: ${docName}` : ""}\n` +
            `Resuélvelo en Wuolah. El script continuará automáticamente cuando puedas volver a descargar.`
          );

          const resumed = await waitForCaptchaCounterPositive();
          await refreshTokens();

          isPaused = false;
          pauseResolver?.(resumed);
          return resumed;
        };

        let nextDocIndex = 0;
        const maxConcurrency = 4;
        const concurrency = Math.max(1, Math.min(maxConcurrency, docs.length));

        const workers = Array.from({ length: concurrency }, async () => {
          while (nextDocIndex < docs.length) {
            if (completed + (failed ? 1 : 0) >= docs.length) break;
            if (progress.isCancelled() || failed) return;

            const myIndex = nextDocIndex++;
            if (myIndex >= docs.length) break;
            const doc = docs[myIndex];

            let success = false;
            while (!success && !failed && !progress.isCancelled()) {
              if (isPaused) {
                if (!await waitIfPaused()) return;
              }

              if (availableTokens !== null && availableTokens <= 0) {
                if (!await triggerPause()) return;
                continue;
              }

              if (availableTokens !== null) availableTokens--;

              try {
                setStatusSafe(`Descargando ${completed + 1}/${docs.length}: ${doc.name}`);
                const dl = await Api.docUrlResult(doc.id);

                if (dl.url !== null) {
                  let buf = await Api.docData(dl.url);
                  if (doc.fileType === "application/pdf") {
                    setStatusSafe(`Limpiando PDF (${completed + 1}/${docs.length}): ${doc.name}`);
                    buf = await handlePDF(buf);
                  }

                  zip.file(doc.name, buf, { binary: true });
                  completed++;
                  progress.setProgress(completed, docs.length);
                  setStatusSafe(`Completado ${completed}/${docs.length}`);
                  success = true;
                } else {
                  if (availableTokens !== null) availableTokens++;

                  if (dl.status === 429 && dl.code === "FI008") {
                    if (!await triggerPause(doc.name)) return;
                  } else {
                    throw new Error(`download failed (status ${dl.status}${dl.code ? `, code ${dl.code}` : ""})`);
                  }
                }
              } catch (e) {
                failed = true;
                fatalError = e instanceof Error ? e.message : String(e);
                return;
              }
            }
          }
        });

        await Promise.all(workers);

        if (!failed) {
          progress.setStatus("Generando ZIP…");
          progress.setProgress(docs.length, docs.length);
          zip.generateAsync({ type: "base64" }).then(bs64 => {
            const a = document.createElement('a');
            a.href = "data:application/zip;base64," + bs64;
            a.setAttribute("download", `${folderName}.zip`);
            a.click();
            a.remove();
            progress.done(`ZIP listo: ${folderName}.zip`);
            setTimeout(() => progress.remove(), 5000);
          }).catch(err => {
            Misc.log(err, Log.ERROR);
            progress.setError("Error generando el ZIP");
          })
        } else {
          if (progress.isCancelled()) {
            progress.setError("Descarga cancelada por el usuario");
          } else {
            progress.setError(`Descarga interrumpida${fatalError ? `\n${fatalError}` : ""}`);
          }
        }
      });
    }).catch(err => {
      Misc.log(`Error al obtener info de la carpeta: ${err}`, Log.ERROR);
      progress.setError("Error obteniendo la información de la carpeta");
    });
  }
}
