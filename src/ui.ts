import { GM } from '$';
import c from './config';
import clean_ui from './styles/clean_ui.scss?inline'

export const addOptions = () => {
  // Config
  GM.registerMenuCommand(
    "Configuración",
    () => c().open(),
    'c'
  );
}

export const cleanUI = () => GM.addStyle(clean_ui)
