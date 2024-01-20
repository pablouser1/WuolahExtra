import Helpers from "../Helpers";
import { HookAfter, HookBefore, HookConfig } from "../types/Hooks";

type FetchFunc = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export default class FetchHook {
    origFetch: FetchFunc
    debug: boolean = false

    before: HookBefore[] = []
    after: HookAfter[] = []

    constructor() {
        this.origFetch = window.fetch
    }

    addHooks(hooks: HookConfig): void {
        if (hooks.before !== undefined) {
            this.before = hooks.before
        }
        
        if (hooks.after !== undefined) {
            this.after = hooks.after
        }
    }

    async entrypoint(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        // los strings en js son inmutables,
        // convertimos a url para poder modificarlos más adelante
        if (typeof input === "string" && input.includes("/v2/download")) {
            input = new URL(input);
        }

        this.beforeHandler(input, init)
        const res = await this.origFetch(input, init)
        this.afterHandler(res)
        return res
    }

    setDebug(debug: boolean) {
        this.debug = debug
    }

    private beforeHandler(input: RequestInfo | URL, init?: RequestInit) {
        const path = Helpers.getPath(input.toString())
        const hook = this.before.find(item => item.endpoint.test(path))
        if (hook !== undefined) {
            if (this.debug) {
                console.log(`${hook.id} PRE`, { input, init })
            }
            hook.func(input, init)
            if (this.debug) {
                console.log(`${hook.id} POST`, { input, init })
            }
        }
    }

    private afterHandler(res: Response) {
        const path = Helpers.getPath(res.url)
        const hook = this.after.find(item => item.endpoint.test(path))
        if (hook !== undefined) {
            if (this.debug) {
                console.log(`${hook.id} PRE`, { res })
            }
            hook.func(res)
            if (this.debug) {
                console.log(`${hook.id} POST`, { res })
            }
        }
    }
}
