import { unsafeWindow } from "$";
import Hooks from "./constants/Hooks";
import Log from "./constants/Log";
import { init } from "./config";
import Misc from "./helpers/Misc";
import FetchHook from "./interceptors/Fetch";
import { addOptions } from "./ui";

Misc.log('STARTING', Log.INFO)

// Fetch hooking
const fetchHook = new FetchHook()
fetchHook.addHooks({
  before: Hooks.BEFORE,
  after: Hooks.AFTER
})

init(fetchHook)

// Monkey-patching fetch
unsafeWindow.fetch = (...args) => fetchHook.entrypoint(...args)

// Add menu
addOptions()
