import market from './OttoMarketplace.json';
import storage from './OttoStorage.json';

const projectId = '2DVKDKJperqMtzMq8ySOCR24ZV4';
const projectSecret = '6994f75ec6434bd9edefced739874118';
export const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
export const StorageAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const StorageAddressABI = storage.abi;
export const MarketAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
export const MarketAddressABI = market.abi;
