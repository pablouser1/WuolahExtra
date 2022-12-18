export default class Helpers {
    static log(msg: string): void {
        if (GM_config.get('debug')) {
            console.debug(`[WuolahExtra] ${msg}`)
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
}
