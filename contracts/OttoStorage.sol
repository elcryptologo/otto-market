// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./Allowable.sol";
import "./IOttoMarketplace.sol";

contract OttoStorage is Ownable, IOttoMarketplace { 
    Allowable access;

    constructor(address _allowable) {
        access = Allowable(_allowable);
    }

    modifier isAllowed {
      require(access.hasAccess(msg.sender));
      _;
    }
    
    //Token URIs
    mapping (bytes32 => string) private tokenURIs;    

    function setTokenUri(bytes32 _tokenSeller, string memory _tokenURI) public isAllowed {
         tokenURIs[_tokenSeller] = _tokenURI; 
    }     
    
    function getTokenUri(bytes32 _tokenSeller) public view isAllowed returns (string memory) { 
        return(tokenURIs[_tokenSeller]); 
    } 
    
    //Token Ids
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    function currentTokenId () public view isAllowed returns (uint256 _amount) {
        return tokenIds.current();
    }

    function nextTokenId() public isAllowed returns (uint256 _amount) {
        tokenIds.increment();
        return tokenIds.current();
    }

    //Items Sold
    Counters.Counter private itemsSold;
    
    function getItemsSold() public view isAllowed returns (uint256 _amount) {
        return itemsSold.current();
    }

    function anotherSold() public isAllowed {
        itemsSold.increment();
    }

    // Listing Price
    uint256 listingPrice = 0.025 ether;    
    
    function updateListingPrice(uint _listingPrice) public payable onlyOwner {
      listingPrice = _listingPrice;
    }

    function getListingPrice() public virtual view isAllowed returns (uint256 _listingPrice) {
      return listingPrice;
    }

    // Otto Share
    uint128 constant ottoShare = 3;
    
    function getOttoShare() public view isAllowed returns (uint128 _ottoShare){
        return ottoShare;
    }

    // Scale
    uint128 constant scale = 10;
    
    function getScale() public view isAllowed returns (uint128 _scale){
        return scale;
    }

    // Otto Wallet
    address constant otto = 0x4f1401d78d87B1025423F4f7a478F3164cf3B2F8 ;
    
    function getOttoWallet() public view isAllowed returns (address _otto) {
        return otto;
    }

    // Token Sellers
    bytes32[] private tokenSellers;
    
    function addTokenSeller(bytes32 _seller) public isAllowed {
        tokenSellers.push(_seller);
    }

    function getTokenSellers() public view isAllowed returns (bytes32[] memory _addresses) {
        return tokenSellers;
    }

    function newMarketItem(
      bytes32 _tokenSeller, 
      uint256 _tokenId, 
      address payable _seller, 
      address payable _owner, 
      uint256 _price, 
      uint256 _amount, 
      uint256 _sold
    )
      public view isAllowed returns (MarketItem memory _item) 
    {
        _item = MarketItem (_tokenSeller,
            _tokenId,
            _seller,
            _owner,
            _price,
            _amount,
            _sold
          );
    }

    mapping(bytes32 => MarketItem) private marketItems;
    
    function setMarketItem (bytes32 _seller, MarketItem memory _item) public isAllowed {
        marketItems[_seller] = _item;
    }

    function getMarketItem (bytes32 _sellerId) public view isAllowed returns (MarketItem memory _item)
    {
      return (marketItems[_sellerId]);
    }

    /* Returns all unsold market items */
    function fetchAllItems() public view isAllowed returns (MarketItem[] memory _items) 
    {
      uint256 currentIndex = 0;
      uint256 totalTokens = 0;
      
      for (uint i = 0; i < tokenSellers.length; i++){
        totalTokens += 1;
      }

      _items = new MarketItem[](totalTokens);
      
      for (uint i = 0; i < totalTokens; i++) {
        MarketItem storage currentItem = marketItems[tokenSellers[i]];

          _items[currentIndex] = currentItem;
        currentIndex += 1;
      }
      return (_items);
    }

    /* Returns all unsold market items */
    function fetchMarketItems(address market) public view isAllowed returns (MarketItem[] memory _items) 
    {
      uint256 currentIndex = 0;
      uint256 totalTokens = 0;
      
      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == market) {
          totalTokens += 1;
        }
      }

      _items = new MarketItem[](totalTokens);

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == market) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];

          _items[currentIndex] = currentItem;

          currentIndex += 1;
        }
      }

      return (_items);
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs(address sender) public view isAllowed returns (MarketItem[] memory _items) 
    {
      uint totalTokens = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == sender) {
          totalTokens += 1;
        }
      }

      _items = new MarketItem[](totalTokens);

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == sender) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];

          _items[currentIndex] = currentItem;

          currentIndex += 1;
        }
      }

      return (_items);
    }

    /* Returns only items a user has listed */
    function fetchItemsListed(address sender) public view isAllowed returns (MarketItem[] memory _items) 
    {
      uint totalTokens = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].seller == sender && marketItems[tokenSellers[i]].sold < marketItems[tokenSellers[i]].amount) {
          totalTokens += 1;
        }
      }

      _items = new MarketItem[](totalTokens);

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].seller == sender && marketItems[tokenSellers[i]].sold < marketItems[tokenSellers[i]].amount) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];

          _items[currentIndex] = currentItem;

          currentIndex += 1;
        }
      }
      return (_items);
    }
}