import type { MissingPDFHeaderError } from 'pdf-lib'
import PDFLib from '../types/pdflib'
import Log from '../constants/Log'
import Helpers from '../Helpers'

const openBlob = (obj: Blob, setDownload: boolean, title?: string): void => {
    const url = origcreateObjectURL(obj)
    const a = document.createElement('a')
    a.href = url
    if (setDownload) {
        a.download = title || 'wuolahextra-out'
    }

    a.click()
}

const { createObjectURL: origcreateObjectURL } = unsafeWindow.URL

const objectURLWrapper = (obj: Blob | MediaSource): string => {
    if (!(obj instanceof Blob && obj.type === "application/octet-stream")) {
        return origcreateObjectURL(obj)
    }
    
    // Conseguimos los datos y vemos si los headers son los de un pdf
    obj.arrayBuffer().then(async (buf) => {
        if (Helpers.isPdf(buf)) {
            const doc = await PDFLib.PDFDocument.load(buf)
            Helpers.log('Limpiando documento', Log.INFO)
            // Spam primera página
            doc.removePage(0)
            // Guardar
            const data = await doc.save()
            const newBlob = new Blob([data])
            openBlob(newBlob, true, doc.getTitle())
        } else {
            openBlob(obj, false)
        }
    }).catch((err: MissingPDFHeaderError) => {
        Helpers.log(err.message, Log.DEBUG)
    })

    return "javascript:void(0)" // Evitamos que se abra la version sin limpiar
}

export default objectURLWrapper
