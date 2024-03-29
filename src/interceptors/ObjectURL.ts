import { PDFDocument } from 'pdf-lib'
import ClearMethods from '../constants/ClearMethods'
import Log from '../constants/Log'
import Misc from '../helpers/Misc'
import { clean_pdf } from 'gulagcleaner_wasm'
import c from '../config'

const { createObjectURL: origcreateObjectURL } = window.URL

/**
 * Wrapper para abrir un Blob
 * @param obj Blob ya listo para descargar
 */
const openBlob = (obj: Blob): void => {
  const url = origcreateObjectURL(obj)
  const a = document.createElement('a')
  a.setAttribute("href", url)
  a.setAttribute("target", "_blank")
  a.click()
}

/**
 * Limpia el documento usando el método GulagCleaner
 * @param buf Buffer de documento sin limpiar
 */
const clearGulag = (buf: ArrayBuffer): BlobPart => {
  return clean_pdf(new Uint8Array(buf), false)
}

/**
 * Limpia el documento usando el método PDFLib
 * @param buf Buffer de documento sin limpiar
 * @todo Limpiar todo correctamente
 */
const clearPDFLib = async (buf: ArrayBuffer): Promise<BlobPart> => {
  const doc = await PDFDocument.load(buf)
  // Spam primera página
  doc.removePage(0)
  // Guardar
  const data = await doc.save()
  return data
}

const objectURLWrapper = (obj: Blob | MediaSource): string => {
  if (!(obj instanceof Blob && obj.type === "application/octet-stream")) {
    return origcreateObjectURL(obj)
  }

  // Conseguimos los datos y vemos si los headers son los de un pdf
  obj.arrayBuffer().then(async (buf) => {
    if (!Misc.isPdf(buf)) {
      openBlob(obj)
      return
    }

    Misc.log('Limpiando documento', Log.INFO)

    // Elegimos método de limpieza
    let data: BlobPart
    const clearMethod = c().get("clear_pdf").toString()
    switch (clearMethod) {
      case ClearMethods.PDFLIB:
        data = await clearPDFLib(buf)
        break
      case ClearMethods.GULAG:
        data = clearGulag(buf)
        break
      default:
        alert("Invalid clear method! Fallback to original pdf")
        data = buf
    }

    // Nuevo blob y abrimos
    const newBlob = new Blob([data], { type: "application/pdf" });
    openBlob(newBlob)
  })

  return "javascript:void(0)" // Evitamos que se abra la version sin limpiar
}

export default objectURLWrapper
