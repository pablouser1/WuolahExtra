import { clean_pdf } from "gulagcleaner_wasm";
import ClearMethods from "../constants/ClearMethods";
import { PDFDocument } from "pdf-lib";
import { origcreateObjectURL } from "../originals";
import xmlRequestPromise from "./BypassRequest";

/**
 * Wrapper para abrir un Blob
 * @param obj Blob ya listo para descargar
 * @param filename Nombre del fichero, opcional
 * @param revokeWhenOpened Elimina la referencia al blob al abrirlo, liberando memoria
 */
export const openBlob = (obj: Blob, filename: string = "", revokeWhenOpened: boolean = true): void => {
  const url = origcreateObjectURL(obj);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  if (filename !== "") a.setAttribute("download", filename);
  a.setAttribute("target", "_blank");
  a.click();
  a.remove();
  if (revokeWhenOpened) {
    window.URL.revokeObjectURL(url);
  }
};

/**
 * Limpia el documento usando el método GulagCleaner
 * @param buf Buffer de documento sin limpiar
 */
const clearGulag = (buf: ArrayBuffer): ArrayBuffer => {
  return clean_pdf(new Uint8Array(buf), false);
};

const clearTrolah = async (buf: ArrayBuffer): Promise<ArrayBuffer> => {
  try {
    const data = new FormData();
    data.append('file', new Blob([buf]));
    const res = await xmlRequestPromise({
      url: 'http://lostemmye.lime.seedhost.eu:2024/process_pdf',
      method: 'POST',
      data
    });

    if (res.response === null) {
      return buf;
    }

    return res.response!;
  } catch (e) {
    alert("¡No se pudo obtener el PDF de TrolahCleaner, usando PDF original!\nConsulta https://github.com/pablouser1/WuolahExtra para más información");
    return buf;
  }
}

/**
 * Limpia el documento usando el método PDFLib
 * @param buf Buffer de documento sin limpiar
 * @todo Limpiar todo correctamente
 */
const clearPDFLib = async (buf: ArrayBuffer): Promise<ArrayBuffer> => {
  const doc = await PDFDocument.load(buf);
  // Spam primera página
  doc.removePage(0);
  // Guardar
  const data = await doc.save();
  return data;
};

/**
 * Procesa un PDF usando un método de limpieza
 * @param origData PDF sin procesar
 * @returns `ArrayBuffer` con el PDF procesado
 */
const handlePDF = async (origData: ArrayBuffer): Promise<ArrayBuffer> => {
  // Elegimos método de limpieza
  let data: BlobPart;
  const clearMethod = GM_config.get("clear_pdf").toString();
  switch (clearMethod) {
    case ClearMethods.PDFLIB:
      data = await clearPDFLib(origData);
      break;
    case ClearMethods.GULAG:
      data = clearGulag(origData);
      break;
    case ClearMethods.TROLAH:
      data = await clearTrolah(origData);
      break;
    case ClearMethods.NONE:
      data = origData;
      break;
    default:
      alert("Invalid clear method! Fallback to original pdf");
      data = origData;
  }

  return data;
};

export default handlePDF;
