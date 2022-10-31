import market from './OttoMarketplace.json';

const projectId = '2DVKDKJperqMtzMq8ySOCR24ZV4';
const projectSecret = '6994f75ec6434bd9edefced739874118';
export const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
export const MarketAddress = '0xbaee215172D49C58d98873cf819099c0e0Cb9aCD';
export const MarketAddressABI = market.abi;
