import clean_ui from "./styles/clean_ui.scss";

export const addOptions = () => GM.registerMenuCommand("Config", () => GM_config.open());

/**
 * Inyecta estilo de `./styles/clean_ui` a la página
 */
export const cleanUI = () => GM.addStyle(clean_ui);
