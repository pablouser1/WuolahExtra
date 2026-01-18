import { origFetch } from "../originals";
import ApiRes from "../types/ApiRes";
import Doc from "../types/Doc";
import DocUrl from "../types/DocUrl";
import DownloadBody from "../types/DownloadBody";
import Misc from "./Misc";

/**
 * Wuolah API
 */
export default class Api {
  static BASE_URL = "https://api.wuolah.com/v2";
  static TOKEN_KEY = "token";

  /**
   * Devuelve el perfil del usuario actual.
   * Nota: usa `origFetch` para evitar hooks de userscript (p.ej. makePro).
   */
  static async me(): Promise<{ captchaCounter?: number } & Record<string, unknown>> {
    const res = await origFetch(`${Api.BASE_URL}/me`, Api._buildInit());
    const json = (await res.json()) as { captchaCounter?: number } & Record<string, unknown>;
    return json;
  }

  /**
   * Lista todos los documentos de una carpeta
   * @param id Id carpeta
   * @returns Todos los documentos pertenecientes a la carpeta
   */
  static async folder(id: number): Promise<Doc[]> {
    const params = new URLSearchParams();
    params.append("filter[uploadId]", id.toString());
    params.append("pagination[page]", "0");
    params.append("pagination[pageSize]", "9999");
    params.append("pagination[withCount]", "false");

    const res = await origFetch(
      `${Api.BASE_URL}/documents?${params.toString()}`,
      Api._buildInit()
    );
    const json: ApiRes<Doc[]> = await res.json();
    return json.data;
  }

  /**
   * Obtiene la información de una subida (carpeta o archivo)
   * @param id Id de la subida
   * @returns Datos de la subida
   */
  static async uploadInfo(id: number): Promise<Doc> {
    const res = await origFetch(
      `${Api.BASE_URL}/uploads/${id}`,
      Api._buildInit()
    );
    const json: Doc = await res.json();
    return json;
  }

  /**
   * Consigue URL del documento a partir de su ID
   * @param id Id documento
   * @returns Url para descargar documento
   */
  static async docUrl(id: number): Promise<string | null> {
    const result = await Api.docUrlResult(id);
    return result.url;
  }

  /**
   * Igual que `docUrl`, pero devuelve información extra cuando falla.
   * Útil para detectar captchas (p.ej. 429 + { code: "FI008" }).
   */
  static async docUrlResult(
    id: number
  ): Promise<{ url: string | null; status: number; code?: string }> {
    const body: DownloadBody = {
      adblockDetected: false,
      ads: [],
      fileId: id,
      machineId: "",
      noAdsWithCoins: false,
      qrData: null,
      referralCode: "",
      ubication17ExpectedPubs: 0,
      ubication17RequestedPubs: 0,
      ubication1ExpectedPubs: 0,
      ubication1RequestedPubs: 0,
      ubication2ExpectedPubs: 0,
      ubication2RequestedPubs: 0,
      ubication3ExpectedPubs: 0,
      ubication3RequestedPubs: 0,
    };

    const bodyStr = JSON.stringify(body);
    const res = await origFetch(`${Api.BASE_URL}/download`, {
      method: "POST",
      body: bodyStr,
      ...Api._buildInit(),
    });

    if (!res.ok) {
      let code: string | undefined;
      try {
        const errJson = (await res.clone().json()) as { code?: string };
        code = errJson.code;
      } catch {
        // ignore
      }
      return { url: null, status: res.status, code };
    }

    const data: DocUrl = await res.json();
    return { url: data.url, status: res.status };
  }

  /**
   * Descarga un documento
   * @param url Url del documento
   * @returns Documento ya descargado como `ArrayBuffer`
   */
  static async docData(url: string): Promise<ArrayBuffer> {
    const res = await origFetch(url);
    const buf = await res.arrayBuffer();
    return buf;
  }

  private static _getToken(): string {
    return Misc.getCookie(Api.TOKEN_KEY);
  }

  private static _buildInit(): RequestInit {
    return {
      headers: {
        Authorization: `Bearer ${Api._getToken()}`,
      },
    };
  }
}
