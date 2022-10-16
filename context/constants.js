import market from './OttoMarketplace.json';

const projectId = '2DVKDKJperqMtzMq8ySOCR24ZV4';
const projectSecret = '6994f75ec6434bd9edefced739874118';
export const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
export const MarketAddress = '0x0B306BF915C4d645ff596e518fAf3F9669b97016';
export const MarketAddressABI = market.abi;
