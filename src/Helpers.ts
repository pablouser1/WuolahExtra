import { initSync } from "gulagcleaner_wasm"
import Log from "./constants/Log"

export default class Helpers {
    private static logValues = Object.values(Log)

    static log(msg: string, mode: Log = Log.DEBUG): void {
        const data = `[WuolahExtra] (${Helpers.logValues[mode]}) ${msg}`
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
        for(var i = 0; i < arr.length; i++) {
           header += arr[i].toString(16);
        }
        return header === '255044462d'; // PDF header
    }

    static initGulag(): void {
        Helpers.log("Injecting WASM", Log.DEBUG);
        fetch(GM_getResourceURL("gulag-wasm"))
            .then(res => res.arrayBuffer())
            .then(data => initSync(data))
    }
}
