export { default as CaptchaCounterDebugUI } from "./CaptchaCounterDebugUI";
export { default as ProgressUI } from "./ProgressUI";

export const addOptions = () => GM.registerMenuCommand("Config", () => GM_config.open());

