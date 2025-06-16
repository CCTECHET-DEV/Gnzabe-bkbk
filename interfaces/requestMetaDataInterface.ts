export interface IRequestMetaData {
  ip: string;
  device: {
    source: string;
    browser: string;
    version: string;
    os: string;
    platform: string;
    isMobile: boolean;
    isDesktop: boolean;
  };
}
