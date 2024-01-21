import { GM } from "$"
import { initSync } from "gulagcleaner_wasm"
import { config } from "../common"
import Log from "../constants/Log"

export default class Misc {
  private static logValues = Object.values(Log)

  static log(msg: string, mode: Log = Log.DEBUG): void {
    const data = `[WuolahExtra] (${Misc.logValues[mode]}) ${msg}`
    switch (mode) {
      case Log.DEBUG:
        if (config.c.get('debug')) {
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

  static async initGulag(): Promise<void> {
    Misc.log("Injecting WASM", Log.DEBUG);
    // The TS types incorrectly say that GM has a
    // method called "getResourceURL" instead of the real one
    // @ts-expect-error
    const url = await GM.getResourceUrl("gulag-wasm")
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    initSync(buf)
  }
}
