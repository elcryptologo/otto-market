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

contract OttoMarketplace is Ownable, ERC1155, IERC1155Receiver, ReentrancyGuard {
    OttoStorage db;
    OttoRoyalty royalty;

    struct MarketItem {
      bytes32 tokenSeller;
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      uint256 amount;
      uint256 sold;
    }

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
      royalty.setDefaultRoyalty(address(this), 0);
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
      require(_price > 0, "Price must be at least 1 wei");
      require(msg.value == db.getListingPrice(), "Price must be equal to listing price");
      //TODO require() balance of sender matic

      db.setMarketItem(_tokenSeller,  db.newMarketItem(
        _tokenSeller,
        _tokenId,
        payable(msg.sender),
        payable(address(this)),
        _price,
        _amount,
        0
      ));
    }

    function createResellItem(bytes32 _tokenSeller, bytes32 _newTokenSeller, uint256 _price, uint256 _amount)private {
      require(_price > 0, "Price must be at least 1 wei");
      require(_amount > 0, "Amount must be greater than 0");
      
      (uint256 tokenId, , , , , ) = db.getMarketItem(_tokenSeller);
      require(tokenId > 0, "Invalid token.");     

       (uint256 newTokenId, , , , , ) = db.getMarketItem(_newTokenSeller);
      require(newTokenId == 0, "Reseller already registered");

      db.addTokenSeller(_newTokenSeller);
      db.setTokenUri(_newTokenSeller, db.getTokenUri(_tokenSeller));

      db.setMarketItem(_newTokenSeller, db.newMarketItem(
        _newTokenSeller,
        tokenId,
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
      require(_amount > 0, "Invalid amount.");

      (uint256 tokenId, 
        address payable seller, 
        address payable owner,
        uint256 price, 
        uint256 amount, 
        uint256 sold) = db.getMarketItem(_tokenSeller);

      require( tokenId > 0, "Invalid tokenId.");
      require(_amount <= amount - sold, "Cannot buy more than the available amount.");
      require(msg.value == price * _amount, "Please submit the asking price in order to complete the purchase");

      uint fee = msg.value * db.getOttoShare() / royalty.feeDenominator();
      
      (address origOwner, uint256 royalties) = royalty.royaltyInfo(tokenId, msg.value);
      payable(this.owner()).transfer(db.getListingPrice());
      payable(origOwner).transfer(royalties);
      payable(db.getOttoWallet()).transfer(fee);
      seller.call{value: (msg.value - fee - royalties), gas: 5000};

      bytes32 newTokenSeller = hash(msg.sender, tokenId, "");

      sold += _amount;
      if (!updateResellItem(newTokenSeller, _amount)){ 
        createResellItem(_tokenSeller, newTokenSeller, price, _amount);
      }

      this.safeTransferFrom(address(this), msg.sender, tokenId, _amount, "");
      
      if (amount == sold){
        owner = payable(address(0));
        db.anotherSold();
      }

      db.setMarketItem(_tokenSeller, db.newMarketItem(
        _tokenSeller, 
        tokenId, 
        seller, 
        owner, 
        price, 
        amount, 
        sold
      ));
    }

    function updateResellItem(bytes32 _tokenSeller, uint256 _amount)
      private 
      returns (bool) 
    {      
      (uint256 tokenId, 
        address payable seller, 
        address payable owner, 
        uint256 price,
        uint256 amount, 
        uint256 sold) = db.getMarketItem(_tokenSeller);

      if (tokenId == 0) return false;
    
      amount += _amount;
      owner = payable(msg.sender);
      seller = payable(address(0));

      db.setMarketItem(_tokenSeller, db.newMarketItem(
        _tokenSeller, 
        tokenId, 
        seller, 
        owner, 
        price, 
        amount, 
        sold
      ));
      
      db.setTokenUri(_tokenSeller, db.getTokenUri(_tokenSeller));

      return true;
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(bytes32 _tokenSeller, string memory _tokenURI, uint256 _price) public payable {
      (uint256 tokenId, 
        address payable seller, 
        address payable owner, 
        uint256 price, 
        uint256 amount, 
        uint256 sold) = db.getMarketItem(_tokenSeller);

      require(owner == msg.sender, "Only item owner can perform this operation");
      require(balanceOf(msg.sender, tokenId) >= 0, "Cannot sell tokens you do not own.");
      require(msg.value >= db.getListingPrice(), "Price must be equal or greater to listing price");   

      uint256 origAmount = amount;
      
      price = _price;
      seller = payable(msg.sender);
      owner = payable(address(this));

      db.setMarketItem(_tokenSeller, db.newMarketItem(
        _tokenSeller, 
        tokenId, 
        seller, 
        owner, 
        price, 
        amount, 
        sold
      ));

      db.setTokenUri(_tokenSeller, _tokenURI);
      _safeTransferFrom(msg.sender, address(this), tokenId, origAmount, "");

      // emit db.MarketItemCreated(_tokenSeller, tokenId, msg.sender, address(this), _price, origAmount, sold);
    }

    function getAllItems() public view returns (MarketItem[] memory _items) {
      (bytes32[] memory tokenSeller, 
        uint256[] memory tokenId, 
        address[] memory seller, 
        address[] memory owner, 
        uint256[] memory price, 
        uint256[] memory amount, 
        uint256[] memory sold) = db.fetchAllItems();

      _items = new MarketItem[](tokenSeller.length);
      
      for (uint256 i = 0; i < tokenSeller.length; i++) {
        MarketItem memory item = MarketItem(
          tokenSeller[i], 
          tokenId[i], 
          payable(seller[i]), 
          payable(owner[i]), 
          price[i], 
          amount[i], 
          sold[i]
        );

        _items[i] = item;
      }
    }

    function getMarketItems() public view returns (MarketItem[] memory _items) {
      (bytes32[] memory tokenSeller, 
        uint256[] memory tokenId, 
        address[] memory seller, 
        address[] memory owner, 
        uint256[] memory price, 
        uint256[] memory amount, 
        uint256[] memory sold) = db.fetchMarketItems(address(this));

      _items = new MarketItem[](tokenSeller.length);
      
      for (uint256 i = 0; i < tokenSeller.length; i++) {
        MarketItem memory item = MarketItem(
          tokenSeller[i], 
          tokenId[i], 
          payable(seller[i]), 
          payable(owner[i]), 
          price[i], 
          amount[i], 
          sold[i]
        );

        _items[i] = item;
      }      
    }

    function getMyNFTs() public view returns (MarketItem[] memory _items) {
      (bytes32[] memory tokenSeller, 
        uint256[] memory tokenId, 
        address[] memory seller, 
        address[] memory owner, 
        uint256[]  memory price, 
        uint256[] memory amount, 
        uint256[] memory sold) = db.fetchMyNFTs(msg.sender);

      _items = new MarketItem[](tokenSeller.length);
      
      for (uint256 i = 0; i < tokenSeller.length; i++) {
        MarketItem memory item = MarketItem(
          tokenSeller[i], 
          tokenId[i], 
          payable(seller[i]), 
          payable(owner[i]), 
          price[i], 
          amount[i], 
          sold[i]
        );

        _items[i] = item;
      }            
    }

    function getItemsListed() public view returns (MarketItem[] memory _items) {
      (bytes32[] memory tokenSeller, 
        uint256[] memory tokenId, 
        address[] memory seller, 
        address[] memory owner, 
        uint256[] memory price, 
        uint256[] memory amount, 
        uint256[] memory sold) = db.fetchItemsListed(msg.sender);

      _items = new MarketItem[](tokenSeller.length);
      
      for (uint256 i = 0; i < tokenSeller.length; i++) {
        MarketItem memory item = MarketItem(
          tokenSeller[i], 
          tokenId[i], 
          payable(seller[i]), 
          payable(owner[i]), 
          price[i], 
          amount[i], 
          sold[i]
        );

        _items[i] = item;
      }     
    }
}