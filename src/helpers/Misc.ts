import { initSync } from "gulagcleaner_wasm";
import Log from "../constants/Log";
import { PDFDocument } from "pdf-lib";

export default class Misc {
  private static logValues = Object.values(Log);

  static log<T>(msg: T | T[], mode = Log.DEBUG): void {
    const data = `[WuolahExtra] (${Misc.logValues[mode]}) ${msg}`;
    switch (mode) {
      case Log.DEBUG:
        if (GM_config.get("debug")) {
          console.debug(data);
        }
        break;
      case Log.INFO:
        console.log(data);
        break;
      case Log.ERROR:
        console.error(data);
        break;
    }
  }

  /**
   * Extrae el path de una URL
   * @param url_str URL completa
   * @returns Path
   */
  static getPath(url_str: string): string {
    try {
      const url = new URL(url_str);
      const path = url.pathname;
      return path;
    } catch {
      return url_str; // fallback
    }
  }

  /**
   * Comprueba si el archivo dado es un PDF a partir de su header
   * @param data Archivo
   * @returns Es/No es un PDF
   */
  static isPdf(data: ArrayBuffer): boolean {
    const arr = new Uint8Array(data).subarray(0, 5);
    let header = "";
    for (const b of arr) {
      header += b.toString(16);
    }
    return header === "255044462d"; // PDF header
  }

  /**
   * Consigue el nombre del pdf a partir de los metadatos
   * @param pdfBuffer
   * @returns Título del documento, "Untitled" si no lo tiene o "" si no se ha podido leer el documento
   * @throws Error al abrir el documento
   */
  static async extractPDFName(pdfBuffer: ArrayBuffer): Promise<string> {
    try {
      // Load the PDF from the buffer
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Extract the title from the metadata
      const title = pdfDoc.getTitle() ?? "Untitled";

      return title;
    } catch (error) {
      Misc.log(`Error extracting PDF metadata, ${error}`, Log.ERROR);
      return "";
    }
  }

  /**
   * Inicia el modulo WASM de GulagCleaner
   * @link https://github.com/YM162/gulagcleaner/tree/main/gulagcleaner_wasm
   */
  static async initGulag(): Promise<void> {
    Misc.log("Injecting WASM", Log.DEBUG);
    const url = await GM.getResourceUrl("gulagcleaner_wasm");
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    initSync(buf);
  }

  /**
   * Valor de una cookie en `document.cookie`
   * @link https://gist.github.com/hunan-rostomyan/28e8702c1cecff41f7fe64345b76f2ca
   * @param name Nombre de la cookie
   * @returns Valor de la cookie, "" si no se ha encontrado
   */
  static getCookie(name: string): string {
    const nameLenPlus = name.length + 1;
    return (
      document.cookie
        .split(";")
        .map((c) => c.trim())
        .filter((cookie) => {
          return cookie.substring(0, nameLenPlus) === `${name}=`;
        })
        .map((cookie) => {
          return decodeURIComponent(cookie.substring(nameLenPlus));
        })[0] || ""
    );
  }
}
