import cleancss from './styles/clean_ui.scss'

export const addOptions = () => {
    // Config
    GM_registerMenuCommand(
        "Configuración",
        () => GM_config.open(),
        'c'
    );
}

export const cleanUI = () => GM_addStyle(cleancss)
