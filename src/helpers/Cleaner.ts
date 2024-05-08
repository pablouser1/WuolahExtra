import { clean_pdf } from "gulagcleaner_wasm"
import ClearMethods from "../constants/ClearMethods"
import { PDFDocument } from "pdf-lib"
import { origcreateObjectURL } from "../originals";

/**
 * Wrapper para abrir un Blob
 * @param obj Blob ya listo para descargar
 */
export const openBlob = (obj: Blob, filename: string = '', revokeWhenOpened: boolean = true) => {
  const url = origcreateObjectURL(obj);
  const a = document.createElement('a')
  a.setAttribute("href", url)
  if (filename !== '') a.setAttribute("download", filename)
  a.setAttribute("target", "_blank")
  a.click()
  a.remove()
  if (revokeWhenOpened) {
    // Elimina la referencia al Blob, eliminando memoria en el proceso
    window.URL.revokeObjectURL(url);
  }
}

/**
 * Limpia el documento usando el método GulagCleaner
 * @param buf Buffer de documento sin limpiar
 */
const clearGulag = (buf: ArrayBuffer): ArrayBuffer => {
  return clean_pdf(new Uint8Array(buf), false)
}

/**
 * Limpia el documento usando el método PDFLib
 * @param buf Buffer de documento sin limpiar
 * @todo Limpiar todo correctamente
 */
const clearPDFLib = async (buf: ArrayBuffer): Promise<ArrayBuffer> => {
  const doc = await PDFDocument.load(buf)
  // Spam primera página
  doc.removePage(0)
  // Guardar
  const data = await doc.save()
  return data
}

const handlePDF = async (origData: ArrayBuffer): Promise<ArrayBuffer> => {
  // Elegimos método de limpieza
  let data: BlobPart
  const clearMethod = GM_config.get("clear_pdf").toString()
  switch (clearMethod) {
    case ClearMethods.PDFLIB:
      data = await clearPDFLib(origData)
      break
    case ClearMethods.GULAG:
      data = clearGulag(origData)
      break
    default:
      alert("Invalid clear method! Fallback to original pdf")
      data = origData
  }

  return data;
}

export default handlePDF
