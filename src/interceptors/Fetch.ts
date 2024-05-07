import Misc from "../helpers/Misc";
import { HookAfter, HookBefore, HookCommon, HookConfig } from "../types/Hooks";

const { fetch: origFetch } = window

export default class FetchHook {
  debug: boolean = false

  before: HookBefore[] = []
  after: HookAfter[] = []

  addHooks(h: HookConfig): void {
    if (h.before !== undefined) {
      this.before = h.before
    }

    if (h.after !== undefined) {
      this.after = h.after
    }
  }

  async entrypoint(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    this.beforeHandler(input, init) // Before hook
    const res = await origFetch(input, init) // Send request
    this.afterHandler(res) // After hook
    return res
  }

  setDebug(debug: boolean) {
    this.debug = debug
  }

  private beforeHandler(input: RequestInfo | URL, init?: RequestInit) {
    const path = Misc.getPath(input.toString())
    const h = this.before.find((item) => this._finder(item, path))
    if (h !== undefined) {
      if (this.debug) {
        console.log(`${h.id} PRE`, { input, init })
      }
      h.func(input, init)
      if (this.debug) {
        console.log(`${h.id} POST`, { input, init })
      }
    }
  }

  private afterHandler(res: Response) {
    const path = Misc.getPath(res.url)
    const h = this.after.find((item) => this._finder(item, path))
    if (h !== undefined) {
      if (this.debug) {
        console.log(`${h.id} PRE`, { res })
      }
      h.func(res)
      if (this.debug) {
        console.log(`${h.id} POST`, { res })
      }
    }
  }

  private _finder(item: HookCommon, path: string) {
    const found = item.endpoint.test(path)
    if (found) {
      return item.cond === undefined ? true : item.cond()
    }

    // Not found
    return false
  }
}
