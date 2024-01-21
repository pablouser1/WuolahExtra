/**
 * 17 -> Portada
 * 
 * 1 -> A4
 * 
 * 2 -> Lateral
 * 
 * 3 -> Footer
 */
export default interface DownloadBodyOld {
  source: string;
  premium: number;
  blocked: boolean;
  captcha?: string;
  captchaToken?: string;
  ubication17ExpectedPubs: number;
  ubication1ExpectedPubs: number;
  ubication2ExpectedPubs: number;
  ubication3ExpectedPubs: number;
  ubication17RequestedPubs: number;
  ubication1RequestedPubs: number;
  ubication2RequestedPubs: number;
  ubication3RequestedPubs: number;
}
