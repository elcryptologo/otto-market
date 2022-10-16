// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract OttoMarketplace is ERC1155, IERC1155Receiver, ReentrancyGuard, Ownable, ERC2981 {
    mapping (bytes32 => string) private tokenURIs;
    
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;
    Counters.Counter private itemsSold;

    uint256 listingPrice = 0.025 ether;
    uint128 constant ottoShare = 3;
    uint128 constant scale = 10;
    address constant otto = 0x4f1401d78d87B1025423F4f7a478F3164cf3B2F8 ;

    bytes32[] private tokenSellers;

    struct MarketItem {
      bytes32 tokenSeller;
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      uint256 amount;
      uint256 sold;
    }
    mapping(bytes32 => MarketItem) private marketItems;

    event MarketItemCreated (
      bytes32 indexed tokenSeller,
      uint256 tokenId,
      address seller,
      address owner,
      uint256 price,
      uint256 amount,
      uint256 sold
    );

    constructor() ERC1155("Otto Marketplace") {  
    }
      
    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data)
    external override returns(bytes4) {    
      return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data)
    external override returns(bytes4) {
      return  this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, IERC165, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /* Updates the listing price of the contract */
    function updateListingPrice(uint _listingPrice) 
    public payable onlyOwner {
      listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() 
    public view returns (uint256) {
      return listingPrice;
    }

    function hash(address _addr, uint256 _tokenId, string memory _text) 
    public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_addr, _tokenId, _text));
    }
    
    function setTokenUri(bytes32 _tokenSeller, string memory _tokenURI)
    private {
      console.log('in setTokenUri checking tokenURIs', tokenURIs[_tokenSeller]);
         tokenURIs[_tokenSeller] = _tokenURI; 
    }     
    
    function tokenURI(bytes32 _tokenSeller) 
    public view returns (string memory) { 
        return(tokenURIs[_tokenSeller]); 
    } 

    /* Mints a token and lists it in the marketplace */
    function createToken(string memory _tokenURI, uint256 _price, uint256 _amount) 
    public payable returns (bytes32) {
      tokenIds.increment();
      uint256 tokenId = tokenIds.current();
      bytes32 tokenSeller = hash(msg.sender, tokenId, "");
        
      _mint(address(this), tokenId, _amount, "");
      
      tokenSellers.push(tokenSeller);
      setTokenUri(tokenSeller, _tokenURI);
      createMarketItem(tokenSeller, tokenId, _price, _amount);
      return tokenSeller;
    }

    function createMarketItem(bytes32 _tokenSeller, uint256 _tokenId, uint256 _price, uint256 _amount) 
    private {
      require(_price > 0, "Price must be at least 1 wei");
      require(msg.value == listingPrice, "Price must be equal to listing price");
      //TODO require() balance of sender matic

      marketItems[_tokenSeller] =  MarketItem(
        _tokenSeller,
        _tokenId,
        payable(msg.sender),
        payable(address(this)),
        _price,
        _amount,
        0
      );

      emit MarketItemCreated(
        _tokenSeller,
        _tokenId,
        msg.sender,
        address(this),
        _price,
        _amount,
        0
      );
    }

    function createResellItem(bytes32 _tokenSeller, bytes32 _newTokenSeller, uint256 _price, uint256 _amount)
    private {
      require(_price > 0, "Price must be at least 1 wei");
      require(_amount > 0, "Amount must be greater than 0");
      
      uint256 tokenId = marketItems[_tokenSeller].tokenId;
      require(tokenId > 0, "Invalid token.");      
      require(marketItems[_newTokenSeller].tokenId == 0, "Reseller already registered");

      tokenSellers.push(_newTokenSeller);
      setTokenUri(_newTokenSeller, tokenURI(_tokenSeller));

      marketItems[_newTokenSeller] =  MarketItem(
        _newTokenSeller,
        tokenId,
        payable(address(0)),
        payable(msg.sender),
        _price,
        _amount,
        0
      );
    }
    

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(bytes32 _tokenSeller, uint256 _amount) 
    public payable nonReentrant {
      require(_amount > 0, "Invalid amount.");

      uint256 tokenId = marketItems[_tokenSeller].tokenId;
      require( tokenId > 0, "Invalid tokenId.");

      uint unsold = marketItems[_tokenSeller].amount - marketItems[_tokenSeller].sold;
      require(_amount <= unsold, "Cannot buy more than the available amount.");

      uint price = marketItems[_tokenSeller].price;
      require(msg.value == price * _amount, "Please submit the asking price in order to complete the purchase");

      uint fee = msg.value * ottoShare / scale;
      
      payable(owner()).transfer(listingPrice);
      payable(otto).transfer(fee);
      marketItems[_tokenSeller].seller.call{value: (msg.value - fee), gas: 5000};

      bytes32 newTokenSeller = hash(msg.sender, tokenId, "");

      if (marketItems[newTokenSeller].tokenId > 0 ) {
        marketItems[newTokenSeller].amount += _amount;
        marketItems[newTokenSeller].owner = payable(msg.sender);
        marketItems[newTokenSeller].seller = payable(address(0));
        setTokenUri(newTokenSeller, tokenURI(_tokenSeller));
      }else{     
        createResellItem(_tokenSeller, newTokenSeller, price, _amount);
      }

      marketItems[_tokenSeller].sold += _amount;

      this.safeTransferFrom(address(this), msg.sender, tokenId, _amount, "");
      
      if (marketItems[_tokenSeller].amount == marketItems[_tokenSeller].sold){
        marketItems[_tokenSeller].owner = payable(address(0));
        itemsSold.increment();
      }      
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(bytes32 _tokenSeller, string memory _tokenURI, uint256 _price) 
    public payable {

      require(marketItems[_tokenSeller].owner == msg.sender, "Only item owner can perform this operation");

      uint256 tokenId = marketItems[_tokenSeller].tokenId;
      require(balanceOf(msg.sender, tokenId) >= 0, "Cannot sell tokens you do not own.");
      require(msg.value >= listingPrice, "Price must be equal or greater to listing price");   

      uint256 origAmount = marketItems[_tokenSeller].amount;
      uint256 sold = marketItems[_tokenSeller].sold;   
      
      marketItems[_tokenSeller].price = _price;
      marketItems[_tokenSeller].seller = payable(msg.sender);
      marketItems[_tokenSeller].owner = payable(address(this));
      setTokenUri(_tokenSeller, _tokenURI);
      _safeTransferFrom(msg.sender, address(this), tokenId, origAmount, "");

      emit MarketItemCreated(_tokenSeller, tokenId, msg.sender, address(this), _price, origAmount, sold);
    }

    /* Returns all unsold market items */
    function fetchAllItems() 
    public view returns (MarketItem[] memory) {
      uint256 currentIndex = 0;
      uint256 totalTokens = 0;
      
      for (uint i = 0; i < tokenSellers.length; i++){
        totalTokens += 1;
      }

      MarketItem[] memory items = new MarketItem[](totalTokens);
      for (uint i = 0; i < totalTokens; i++) {
        MarketItem storage currentItem = marketItems[tokenSellers[i]];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
      return items;
    }

    /* Returns all unsold market items */
    function fetchMarketItems() 
    public view returns (MarketItem[] memory) {
      uint256 currentIndex = 0;
      uint256 totalTokens = 0;
      
      for (uint i = 0; i < tokenSellers.length; i++){
        if (marketItems[tokenSellers[i]].owner == address(this)) {
          totalTokens += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](totalTokens);
      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == address(this)) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() 
    public view returns (MarketItem[] memory) {
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].owner == msg.sender) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsListed() 
    public view returns (MarketItem[] memory) {
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].seller == msg.sender && marketItems[tokenSellers[i]].sold < marketItems[tokenSellers[i]].amount) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < tokenSellers.length; i++) {
        if (marketItems[tokenSellers[i]].seller == msg.sender && marketItems[tokenSellers[i]].sold < marketItems[tokenSellers[i]].amount) {
          MarketItem storage currentItem = marketItems[tokenSellers[i]];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
}