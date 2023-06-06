// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IOttoMarketplace {
    struct MarketItem {
      bytes32 tokenCreator;
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      uint256 amount;
      uint256 sold;
    }    
}