import { MissingPDFHeaderError } from 'pdf-lib'
import PDFLib from '../types/pdflib'
import Log from '../constants/Log'
import Helpers from '../Helpers'

const { createObjectURL: origcreateObjectURL } = unsafeWindow.URL

const objectURLWrapper = (obj: Blob | MediaSource): string => {
    let found = true
    if (obj instanceof Blob && obj.type === "application/octet-stream") {
        found = false
        obj.arrayBuffer().then(async (res) => {
            if (Helpers.isPdf(res)) {
                const doc = await PDFLib.PDFDocument.load(res)
                Helpers.log('Limpiando documento', Log.INFO)
                // Spam primer página
                doc.removePage(0)
                // Guardar
                const data = await doc.save()
                const newBlob = new Blob([data])
                const url = origcreateObjectURL(newBlob)
                window.open(url)
            }
        }).catch((err: MissingPDFHeaderError) => {
            Helpers.log(err.message, Log.DEBUG)
        })
    }
    return "javascript:void(0)"
}

export default objectURLWrapper
