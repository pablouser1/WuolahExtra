export default interface DownloadBodyNew {
    machineId: string,
    adblockDetected: boolean,
    fileId: number,
    noAdsWithCoins: boolean,
    ads: any[],
    referralCode: string,
    qrData: string | null
};
