import { GM } from '$';
import { config } from './common';
import clean_ui from './styles/clean_ui.scss?inline'

export const addOptions = () => {
  // Config
  GM.registerMenuCommand(
    "Configuración",
    () => config.c.open(),
    'c'
  );
}

export const cleanUI = () => GM.addStyle(clean_ui)
