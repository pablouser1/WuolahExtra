/**
 * Promisify GM.xmlHttpRequest.
 * Usado para enviar solicitudes a TrolahCleaner e ignorar exigencias de Host-Only o de Mixed Content
 */
const xmlRequestPromise = (details: VMScriptGMXHRDetails<ArrayBuffer>): Promise<VMScriptResponseObject<ArrayBuffer>> => {
  return new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      ...details,
      responseType: 'arraybuffer',
      onload: resolve,
      onerror: reject
    });
  });
}

export default xmlRequestPromise;
