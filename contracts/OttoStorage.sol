// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./Allowable.sol";

contract OttoStorage is Ownable { 
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

    // Market Items
    struct MarketItem {
      bytes32 tokenSeller;
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      uint256 amount;
      uint256 sold;
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

    function getMarketItem (bytes32 _sellerId) public view isAllowed returns (
        uint256 _tokenId, 
        address payable _seller,
        address payable _owner, 
        uint256 _price, 
        uint256 _amount, 
        uint256 _sold
      )
    {
      return (
        marketItems[_sellerId].tokenId,
        marketItems[_sellerId].seller,
        marketItems[_sellerId].owner,
        marketItems[_sellerId].price,
        marketItems[_sellerId].amount,
        marketItems[_sellerId].sold
      );
    }

    /* Returns all unsold market items */
    function fetchAllItems() public  view isAllowed returns (
        bytes32[] memory _tokenSeller, 
        uint256[] memory _tokenId, 
        address[] memory _seller, 
        address[]  memory _owner, 
        uint256[] memory _price, 
        uint256[] memory _amount, 
        uint256[] memory _sold
      ) 
    {
      uint256 currentIndex = 0;
      uint256 totalTokens = 0;
      
      for (uint i = 0; i < tokenSellers.length; i++){
        totalTokens += 1;
      }

      _tokenSeller = new bytes32[](totalTokens);
      _tokenId = new uint256[](totalTokens);
      _seller = new address[](totalTokens);
      _owner = new address[](totalTokens);
      _price = new uint256[](totalTokens);
      _amount = new uint256[](totalTokens);
      _sold = new uint256[](totalTokens);
      
      for (uint i = 0; i < totalTokens; i++) {
        MarketItem storage currentItem = marketItems[tokenSellers[i]];

        _tokenSeller[currentIndex] = currentItem.tokenSeller;
        _tokenId[currentIndex] = currentItem.tokenId;
        _seller[currentIndex] = currentItem.seller;
        _owner[currentIndex] = currentItem.owner;
        _price[currentIndex] = currentItem.price;
        _amount[currentIndex] = currentItem.amount;
        _sold[currentIndex] = currentItem.sold;

        currentIndex += 1;
      }
      return (_tokenSeller,
        _tokenId,
        _seller,
        _owner,
        _price,
        _amount,
        _sold
      );
    }

    /* Returns all unsold market items */
    function fetchMarketItems(address market) public view isAllowed returns (
        bytes32[] memory _tokenSeller, 
        uint256[] memory _tokenId, 
        address[] memory _seller, 
        address[]  memory _owner, 
        uint256[] memory _price, 
        uint256[] memory _amount, 
        uint256[] memory _sold
      ) 
    {
      uint256 currentIndex = 0;
      uint256 totalTokens = 0;
      
      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == market) {
          totalTokens += 1;
        }
      }

      _tokenSeller = new bytes32[](totalTokens);
      _tokenId = new uint256[](totalTokens);
      _seller = new address[](totalTokens);
      _owner = new address[](totalTokens);
      _price = new uint256[](totalTokens);
      _amount = new uint256[](totalTokens);
      _sold = new uint256[](totalTokens);

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == market) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];

          _tokenSeller[currentIndex] = currentItem.tokenSeller;
          _tokenId[currentIndex] = currentItem.tokenId;
          _seller[currentIndex] = currentItem.seller;
          _owner[currentIndex] = currentItem.owner;
          _price[currentIndex] = currentItem.price;
          _amount[currentIndex] = currentItem.amount;
          _sold[currentIndex] = currentItem.sold;

          currentIndex += 1;
        }
      }

      return (_tokenSeller,
        _tokenId,
        _seller,
        _owner,
        _price,
        _amount,
        _sold
      );
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs(address sender) public view isAllowed returns (
        bytes32[] memory _tokenSeller, 
        uint256[] memory _tokenId, 
        address[] memory _seller, 
        address[]  memory _owner, 
        uint256[] memory _price, 
        uint256[] memory _amount, 
        uint256[] memory _sold
      ) 
    {
      uint totalTokens = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == sender) {
          totalTokens += 1;
        }
      }

      _tokenSeller = new bytes32[](totalTokens);
      _tokenId = new uint256[](totalTokens);
      _seller = new address[](totalTokens);
      _owner = new address[](totalTokens);
      _price = new uint256[](totalTokens);
      _amount = new uint256[](totalTokens);
      _sold = new uint256[](totalTokens);

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == sender) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];

          _tokenSeller[currentIndex] = currentItem.tokenSeller;
          _tokenId[currentIndex] = currentItem.tokenId;
          _seller[currentIndex] = currentItem.seller;
          _owner[currentIndex] = currentItem.owner;
          _price[currentIndex] = currentItem.price;
          _amount[currentIndex] = currentItem.amount;
          _sold[currentIndex] = currentItem.sold;

          currentIndex += 1;
        }
      }

      return (
        _tokenSeller,
        _tokenId,
        _seller,
        _owner,
        _price,
        _amount,
        _sold
      );
    }

    /* Returns only items a user has listed */
    function fetchItemsListed(address sender) public view isAllowed returns (
        bytes32[] memory _tokenSeller, 
        uint256[] memory _tokenId, 
        address[] memory _seller, 
        address[]  memory _owner, 
        uint256[] memory _price, 
        uint256[] memory _amount, 
        uint256[] memory _sold
      ) 
    {
      uint totalTokens = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].seller == sender && marketItems[tokenSellers[i]].sold < marketItems[tokenSellers[i]].amount) {
          totalTokens += 1;
        }
      }

      _tokenSeller = new bytes32[](totalTokens);
      _tokenId = new uint256[](totalTokens);
      _seller = new address[](totalTokens);
      _owner = new address[](totalTokens);
      _price = new uint256[](totalTokens);
      _amount = new uint256[](totalTokens);
      _sold = new uint256[](totalTokens);

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].seller == sender && marketItems[tokenSellers[i]].sold < marketItems[tokenSellers[i]].amount) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];

          _tokenSeller[currentIndex] = currentItem.tokenSeller;
          _tokenId[currentIndex] = currentItem.tokenId;
          _seller[currentIndex] = currentItem.seller;
          _owner[currentIndex] = currentItem.owner;
          _price[currentIndex] = currentItem.price;
          _amount[currentIndex] = currentItem.amount;
          _sold[currentIndex] = currentItem.sold;

          currentIndex += 1;
        }
      }
      return (
        _tokenSeller,
        _tokenId,
        _seller,
        _owner,
        _price,
        _amount,
        _sold
      );
    }
}