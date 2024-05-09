import Log from "../constants/Log";
import handlePDF, { openBlob } from "../helpers/Cleaner";
import Misc from "../helpers/Misc";
import { origcreateObjectURL } from "../originals";

const objectURLWrapper = (obj: Blob | MediaSource): string => {
  if (!(obj instanceof Blob && obj.type === "application/octet-stream")) {
    return origcreateObjectURL(obj);
  }

  // Conseguimos los datos y vemos si los headers son los de un pdf
  obj.arrayBuffer().then(async (buf) => {
    if (!Misc.isPdf(buf)) {
      openBlob(obj);
      return;
    }

    const title = Misc.extractPDFName(buf);

    Misc.log("Limpiando documento", Log.INFO);

    const data = await handlePDF(buf);

    // Nuevo blob y abrimos
    const newBlob = new Blob([data], { type: "application/pdf" });
    openBlob(newBlob, await title);
  });

  return "javascript:void(0)"; // Evitamos que se abra la version sin limpiar
};

export default objectURLWrapper;
