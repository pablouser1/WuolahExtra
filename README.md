# WuolahExtra
Userscript para Wuolah.

Para usar este programa necesitas un gestor de userscripts (por ejemplo, [ViolentMonkey](https://violentmonkey.github.io)) instalado en tu navegador.

## Funciones implementadas
* Quita anuncios de los pdfs
* Client-side PRO
    * Puedes descargar carpetas como zips
* Limpiar partes de la interfaz innecesarias

## Instalación
Una vez hayas descargado tu gestor de userscripts, descarga el script desde la sección de [Releases](https://github.com/pablouser1/WuolahExtra/releases), ¡y listo!

## Configuración
Puedes acceder a la configuración del script desde tu gestor de userscripts en el icono de tu barra de herramientas ([más info](https://wiki.greasespot.net/Greasemonkey_Manual:Monkey_Menu#The_Menu))

### Debug
Muestra información para desarrolladores en la consola

### Métodos de limpieza de PDFs
#### GulagCleaner (_gulag_)
✅ Buen funcionamiento, activado por defecto

Internamente usa el paquete `gulagcleaner_wasm`.

#### Wuolah Params (_params_)
⚠️ Puede ser eliminado en cualquier momento

Usa un endpoint antiguo de Wuolah, por ahora da buenos resultados.

#### PDFLib (_pdflib_)
⚠️ Sin terminar

Usa el paquete `pdf-lib`, por ahora solo quita la primera página 

#### Ninguno (_none_)
Deshabilita la eliminación de anuncios

### Limpiar UI
Elimina elementos de la interfaz como patrocinios, enlaces sociales...

## Desarrollo
### Instalar dependencias
```bash
yarn install
```

### Modo desarrollo
```bash
yarn dev
```

### Modo producción
```bash
yarn build
```

## TODO
* Para los métodos GULAG / PDFLib
    * Eliminar los anuncios de los pdfs contenidos en los zips
    * Encontrar la forma de sacar el nombre original del archivo

## Créditos
* [GM_Config](https://github.com/sizzlemctwizzle/GM_config) | [LICENSE](https://github.com/sizzlemctwizzle/GM_config/blob/master/LICENSE)
* [pdflib](https://github.com/Hopding/pdf-lib) | [LICENSE](https://github.com/Hopding/pdf-lib/blob/master/LICENSE.md)
* [gulagcleaner](https://github.com/YM162/gulagcleaner) | [LICENSE](https://github.com/YM162/gulagcleaner/blob/master/LICENSE)
