import Misc from "../helpers/Misc";
import { origFetch } from "../originals";
import { HookAfter, HookBefore, HookCommon, HookConfig } from "../types/Hooks";

export default class FetchWrapper {
  debug: boolean = false;

  before: HookBefore[] = [];
  after: HookAfter[] = [];

  addHooks(h: HookConfig): void {
    if (h.before !== undefined) {
      this.before = h.before;
    }

    if (h.after !== undefined) {
      this.after = h.after;
    }
  }

  /**
   * Entrada principal de todas las solicitudes interceptadas de fetch
   * @param input URL
   * @param init Fetch options
   * @returns Respuesta del servidor
   */
  async entrypoint(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    this.beforeHandler(input, init); // Before hook
    const res = await origFetch(input, init); // Send request
    this.afterHandler(res); // After hook
    return res;
  }

  setDebug(debug: boolean) {
    this.debug = debug;
  }

  private beforeHandler(input: RequestInfo | URL, init?: RequestInit) {
    const path = Misc.getPath(input.toString());
    const h = this.before.find((item) => this._finder(item, path));
    if (h !== undefined) {
      if (this.debug) {
        console.log(`${h.id} PRE`, { input, init });
      }
      h.func(input, init);
      if (this.debug) {
        console.log(`${h.id} POST`, { input, init });
      }
    }
  }

  private afterHandler(res: Response) {
    const path = Misc.getPath(res.url);
    const h = this.after.find((item) => this._finder(item, path));
    if (h !== undefined) {
      if (this.debug) {
        console.log(`${h.id} PRE`, { res });
      }
      h.func(res);
      if (this.debug) {
        console.log(`${h.id} POST`, { res });
      }
    }
  }

  /**
   *
   * @param item Hook actual
   * @param path Path de la URL
   * @returns Bool, true si el endpoint coincide y la condición (si hay) es true
   */
  private _finder(item: HookCommon, path: string): FieldValue {
    const found = item.endpoint.test(path);
    if (found) {
      return item.cond === undefined ? true : item.cond();
    }

    // Not found
    return false;
  }
}
