import cleancss from './styles/clean_ui.scss'

export const addOptions = () => {
    // Config
    GM.registerMenuCommand(
        "Configuración",
        () => GM_config.open(),
        'c'
    );
}

export const cleanUI = () => GM.addStyle(cleancss)
