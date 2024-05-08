export default interface DownloadBody {
  adblockDetected: boolean;
  ads: any[];
  captchaCode?: string;
  fileId: number;
  machineId: string;
  noAdsWithCoins: boolean;
  qrData: string | null;
  referralCode: string;
  ubication1ExpectedPubs: number;
  ubication2ExpectedPubs: number;
  ubication3ExpectedPubs: number;
  ubication17ExpectedPubs: number;
  ubication1RequestedPubs: number;
  ubication2RequestedPubs: number;
  ubication3RequestedPubs: number;
  ubication17RequestedPubs: number;
};
