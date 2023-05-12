// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./OttoStorage.sol";
import "./OttoRoyalty.sol";
import "./IOttoMarketplace.sol";

contract OttoMarketplace is IOttoMarketplace, Ownable, ERC1155, IERC1155Receiver, ReentrancyGuard {
  OttoStorage db;
  OttoRoyalty royalty;
  uint256 constant MAX_GAS_LIMIT = 1000000;
  uint256 constant MAX_MINT_LIMIT = 1000;

  event MarketItemCreated (
    bytes32 indexed tokenSeller,
    uint256 tokenId,
    address seller,
    address owner,
    uint256 price,
    uint256 amount,
    uint256 sold
  );

  constructor(address _ottoStorage, address _ottoRoyalty) ERC1155("Otto Marketplace") {  
    db = OttoStorage(_ottoStorage);
    royalty = OttoRoyalty(_ottoRoyalty);
  }
    
  function onERC1155Received(
    address, 
    address, 
    uint256, 
    uint256, 
    bytes calldata
  )
    external 
    pure 
    override 
    returns (bytes4) 
  {    
    return this.onERC1155Received.selector;
  }

  function onERC1155BatchReceived(
    address, 
    address, 
    uint256[] calldata, 
    uint256[] calldata, 
    bytes calldata
  )
    external 
    pure 
    override 
    returns (bytes4) 
  {
    return  this.onERC1155BatchReceived.selector;
  }

  function supportsInterface(bytes4 interfaceId) 
    public 
    view 
    virtual 
    override (ERC1155, IERC165) 
    returns (bool) 
  {
    return super.supportsInterface(interfaceId);
  }

  /* Returns the listing price of the contract */
  function getListingPrice() public view returns (uint256) {
    return db.getListingPrice();
  }

  function hash(address _addr, uint256 _tokenId, string memory _text) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(_addr, _tokenId, _text));
  }

  function tokenURI (bytes32 _tokenSeller) public view returns (string memory) {
    return db.getTokenUri(_tokenSeller);
  }

  /* Mints a token and lists it in the marketplace */
  function createToken(string memory _tokenURI, uint256 _price, uint256 _amount, uint96 _royaltyFee) public payable returns (bytes32) {
    require(gasleft() <= MAX_GAS_LIMIT, "Gas limit reached");
    require(_amount <= MAX_MINT_LIMIT, "Mint limit reached");
    uint256 tokenId = db.nextTokenId();
    bytes32 tokenSeller = hash(msg.sender, tokenId, "");
      
    _mint(address(this), tokenId, _amount, "");
    royalty.setTokenRoyalty(tokenId, msg.sender, _royaltyFee);
    
    db.addTokenSeller(tokenSeller);
    db.setTokenUri(tokenSeller, _tokenURI);
    createMarketItem(tokenSeller, tokenId, _price, _amount);

    return tokenSeller;
  }

  function createMarketItem(bytes32 _tokenSeller, uint256 _tokenId, uint256 _price, uint256 _amount) private {    
    require(msg.sender.balance >= _price * _amount, "Insufficient funds");
    require(_price > 0, "Price must be at least 1 wei");
    require(msg.value == db.getListingPrice(), "Price must be equal to listing price");


    db.setMarketItem(_tokenSeller, MarketItem(
      _tokenSeller,
      _tokenId,
      payable(msg.sender),
      payable(address(this)),
      _price,
      _amount,
      0
    ));
  }

  function createResellItem(bytes32 _tokenSeller, bytes32 _newTokenSeller, uint256 _price, uint256 _amount) private {
    require(_price > 0, "Price must be at least 1 wei");
    require(_amount > 0, "Amount must be greater than 0");
    
    MarketItem memory item = db.getMarketItem(_tokenSeller);
    require(item.tokenId > 0, "Invalid token.");     

    MarketItem memory newItem = db.getMarketItem(_newTokenSeller);
    require(newItem.tokenId == 0, "Reseller already registered");

    db.addTokenSeller(_newTokenSeller);
    db.setTokenUri(_newTokenSeller, db.getTokenUri(_tokenSeller));

    db.setMarketItem(_newTokenSeller, MarketItem(
      _newTokenSeller,
      item.tokenId,
      payable(address(0)),
      payable(msg.sender),
      _price,
      _amount,
      0
    ));
  }
  

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(bytes32 _tokenSeller, uint256 _amount) public payable nonReentrant {    
    require(gasleft() <= MAX_GAS_LIMIT, "Max gas limit reached");
    require(_amount > 0, "Invalid amount.");

    MarketItem memory item = db.getMarketItem(_tokenSeller);

    require( item.tokenId > 0, "Invalid tokenId.");
    require(_amount <= item.amount - item.sold, "Cannot buy more than the available amount.");
    require(msg.value == item.price * _amount, "Please submit the asking price in order to complete the purchase");
    require(msg.sender.balance >= msg.value, "Insufficient funds");
    
    uint fee = msg.value * db.getOttoShare() / royalty.feeDenominator();
    (address origOwner, uint256 royalties) = royalty.royaltyInfo(item.tokenId, msg.value);
    
    payable(this.owner()).transfer(msg.value - royalties - fee);
    payable(origOwner).transfer(royalties);
    payable(db.getOttoWallet()).transfer(fee);
    item.seller.call{value: (msg.value - fee - royalties), gas: 5000};

    bytes32 newTokenSeller = hash(msg.sender, item.tokenId, "");

    item.sold += _amount;
    if (!updateResellItem(newTokenSeller, _amount)){ 
      createResellItem(_tokenSeller, newTokenSeller, item.price, _amount);
    }

    _safeTransferFrom(address(this), msg.sender, item.tokenId, _amount, "");
    
    if (item.amount == item.sold){
      item.owner = payable(address(0));
      db.anotherSold();
    }

    db.setMarketItem(_tokenSeller, item);
  }

  function updateResellItem(bytes32 _tokenSeller, uint256 _amount)
    private 
    returns (bool) 
  {      
    MarketItem memory item = db.getMarketItem(_tokenSeller);

    if (item.tokenId == 0) return false;
  
    item.amount += _amount;
    item.owner = payable(msg.sender);
    item.seller = payable(address(0));

    db.setMarketItem(_tokenSeller, item);
    
    db.setTokenUri(_tokenSeller, db.getTokenUri(_tokenSeller));

    return true;
  }

  /* allows someone to resell a token they have purchased */
  function resellToken(bytes32 _tokenSeller, string memory _tokenURI, uint256 _price) public payable nonReentrant {
    MarketItem memory item = db.getMarketItem(_tokenSeller);

    require(gasleft() <= MAX_GAS_LIMIT, "Max gas limit reached");
    require(item.owner == msg.sender, "Only item owner can perform this operation");
    require(balanceOf(msg.sender, item.tokenId) >= 0, "Cannot sell tokens you do not own.");
    require(msg.value >= db.getListingPrice(), "Price must be equal or greater to listing price");   

    uint256 origAmount = item.amount;
    
    item.price = _price;
    item.seller = payable(msg.sender);
    item.owner = payable(address(this));

    db.setMarketItem(_tokenSeller, item);

    db.setTokenUri(_tokenSeller, _tokenURI);
    _safeTransferFrom(msg.sender, address(this), item.tokenId, origAmount, "");
  }

  function getAllItems() public view returns (MarketItem[] memory _items) {
    return(db.fetchAllItems());
  }

  function getMarketItems() public view returns (MarketItem[] memory _items) {
    return(db.fetchMarketItems(address(this)));
  }

  function getMyNFTs() public view returns (MarketItem[] memory _items) {
    return(db.fetchMyNFTs(msg.sender));         
  }

  function getItemsListed() public view returns (MarketItem[] memory _items) {
    return(db.fetchItemsListed(msg.sender));
  }
}