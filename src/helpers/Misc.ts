import { initSync } from "gulagcleaner_wasm"
import Log from "../constants/Log"
import { PDFDocument } from 'pdf-lib';

export default class Misc {
  private static logValues = Object.values(Log)

  static log<T>(msg: T | T[], mode = Log.DEBUG): void {
    const data = `[WuolahExtra] (${Misc.logValues[mode]}) ${msg}`
    switch (mode) {
      case Log.DEBUG:
        if (GM_config.get('debug')) {
          console.debug(data)
        }
        break
      case Log.INFO:
        console.log(data)
        break
    }
  }

  static getPath(url_str: string): string {
    try {
      const url = new URL(url_str)
      const path = url.pathname
      return path
    } catch {
      return url_str // If there is an error the URL is probably the path itself
    }
  }

  static isPdf(data: ArrayBuffer): boolean {
    const arr = (new Uint8Array(data)).subarray(0, 5);
    let header = "";
    for (const b of arr) {
      header += b.toString(16);
    }
    return header === '255044462d'; // PDF header
  }

  static async extractPDFName(pdfBuffer : ArrayBuffer) {
    try {
      // Load the PDF from the buffer
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Extract the title from the metadata
      const title = pdfDoc.getTitle() ?? 'Untitled';

      return title;
    } catch (error) {
      console.error('Error extracting PDF metadata:', error);
      throw error;
    }
  }

  static async initGulag(): Promise<void> {
    Misc.log("Injecting WASM", Log.DEBUG);
    const url = await GM.getResourceUrl("gulagcleaner_wasm")
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    initSync(buf)
  }

  // https://gist.github.com/hunan-rostomyan/28e8702c1cecff41f7fe64345b76f2ca
  static getCookie(name: string): string {
    const nameLenPlus = (name.length + 1);
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => {
        return cookie.substring(0, nameLenPlus) === `${name}=`;
      })
      .map(cookie => {
        return decodeURIComponent(cookie.substring(nameLenPlus));
      })[0] || '';
  }
}
