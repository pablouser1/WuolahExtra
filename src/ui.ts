import clean_ui from './styles/clean_ui.scss'

export const addOptions = () => {
  // Config
  GM.registerMenuCommand(
    "Configuración",
    () => GM_config.open()
  );
}

export const cleanUI = () => GM.addStyle(clean_ui)
