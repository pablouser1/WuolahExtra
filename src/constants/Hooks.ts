import Misc from "../helpers/Misc";
import { HookAfter, HookBefore } from "../types/Hooks";
import Log from "./Log";

export default class Hooks {
  static BEFORE: HookBefore[] = [
    {
      id: 'no-analytics',
      endpoint: /^\/v2\/events$/,
      func: Hooks.noAnalytics,
      cond: () => GM_config.get("no_analytics")
    }
  ]

  static AFTER: HookAfter[] = [
    {
      id: 'make-pro',
      endpoint: /^\/v2\/me$/,
      func: Hooks.makePro
    },
    {
      id: 'no-ui-ads',
      endpoint: /^\/v2\/a-d-s$/,
      func: Hooks.noUiAds,
      cond: () => GM_config.get("clean_ui")
    }
  ]

  // -- Before -- //
  static noAnalytics(_input: RequestInfo | URL, init?: RequestInit) {
    if (init) {
      Misc.log('Removing events', Log.INFO)
      init.body = JSON.stringify({
        events: []
      })
    }
  }

  // -- After -- //
  static makePro(res: Response) {
    if (res.ok) {
      Misc.log('Making user client-side pro V2', Log.INFO)
      const json = () => res.clone().json().then(d => ({ ...d, isPro: true }));
      res.json = json;
    }
  }

  static noUiAds(res: Response) {
    if (res.ok) {
      Misc.log('Wiping ui ads array', Log.INFO)

      const json = async () => {
        return { items: [] }
      }

      res.json = json
    }
  }
}
