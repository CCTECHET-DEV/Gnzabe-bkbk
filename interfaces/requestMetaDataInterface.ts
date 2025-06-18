// interface ILocation {
//   location: {
//     range: number[];
//     country: string;
//     region: string;
//     city: string;
//     ll: [number, number];
//     metro: number;
//     zip: string;
//   };

import { Lookup } from 'geoip-lite';

// }
export interface IRequestMetaData {
  ip: string;
  location?: Lookup | undefined;
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
