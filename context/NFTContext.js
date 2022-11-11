import React, { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

import { MarketAddress, MarketAddressABI } from './constants';

export const NFTContext = React.createContext();

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);
const isApprovedForAll = async (signerOrProvider) => fetchContract.isApprovedForAll(signerOrProvider, MarketAddress);

export const NFTProvider = ({ children }) => {
  const nftCurrency = 'ETH';
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);

    if (!isApprovedForAll) fetchContract.setApprovalForAll(MarketAddress, true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection); // const provider = new ethers.providers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const data = await contract.getMarketItems();

    console.log('Before tokenuri');
    const items = await Promise.all(data.map(async ({ tokenSeller, tokenId, seller, owner, price: unformattedPrice, amount, sold }) => {
      const tokenURI = await contract.tokenURI(tokenSeller);
      console.log(`tokenuri: ${tokenURI}`);
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
      return { price, tokenId: tokenId.toNumber(), tokenSeller: tokenSeller.toString(), amount: amount.toNumber(), sold: sold.toNumber(), seller, owner, image, name, description, tokenURI };
    }));
    return items;
  };

  const fetchMyNFTsOrCreatedNFTs = async (type) => {
    setIsLoadingNFT(false);

    if (!isApprovedForAll) fetchContract.setApprovalForAll(MarketAddress, true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const data = (type === 'fetchItemsListed') ? await contract.getItemsListed() : await contract.getMyNFTs();

    const items = await Promise.all(data.map(async ({ tokenSeller, tokenId, seller, owner, price: unformattedPrice, amount, sold }) => {
      const tokenURI = await contract.tokenURI(tokenSeller);
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
      return { price, tokenId: tokenId.toNumber(), tokenSeller: tokenSeller.toString(), amount: amount.toNumber(), sold: sold.toNumber(), seller, owner, image, name, description, tokenURI };
    }));

    return items;
  };

  const createToken = async (url, formInputPrice, formInputAmount, formInputRoyalties) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const amount = parseInt(formInputAmount, 10);
    const royalties = parseInt(formInputRoyalties, 10);
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = await contract.createToken(url, price, amount, royalties, { value: listingPrice.toString() });

    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const resellToken = async (id, url, formInputPrice) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = await contract.resellToken(id, url, price, { value: listingPrice.toString() });

    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const buyNft = async (nft, formInputAmount) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(MarketAddress, MarketAddressABI, signer);

    const amount = parseInt(formInputAmount, 10);
    const price = ethers.utils.parseUnits((nft.price * amount).toString(), 'ether');

    const transaction = await contract.createMarketSale(nft.tokenSeller, amount, { value: price });

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    setCurrentAccount(accounts[0]);
    window.location.reload();
  };

  const checkIfWalletIsConnect = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No accounts found');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  return (
    <NFTContext.Provider value={{ nftCurrency, buyNft, createToken, resellToken, fetchNFTs, fetchMyNFTsOrCreatedNFTs, connectWallet, currentAccount, isLoadingNFT }}>
      {children}
    </NFTContext.Provider>
  );
};
