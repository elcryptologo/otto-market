// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/common/ERC2981.sol";

import "./Allowable.sol";

contract OttoRoyalty is ERC2981 {
    Allowable access;

    constructor (address _address) {
        access = Allowable(_address);
    }

    modifier isAllowed {
      require(access.hasAccess(msg.sender));
      _;
    }

    function _feeDenominator() internal pure override returns (uint96) {
        return 100;
    }   

    function feeDenominator() public view isAllowed returns (uint96) {
        return _feeDenominator();
    }

    function setDefaultRoyalty(address _receiver, uint96 _feeNumerator) public isAllowed {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    } 

    function setTokenRoyalty(uint256 _tokenId, address _receiver, uint96 _feeNumerator) public isAllowed {
        _setTokenRoyalty(_tokenId, _receiver, _feeNumerator);
    }

    function resetTokenRoyalty(uint256 _tokenId) public isAllowed {
        _resetTokenRoyalty(_tokenId);
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) 
        public 
        view 
        override 
        isAllowed 
        returns (address, uint256) 
    {
        return ERC2981.royaltyInfo(_tokenId, _salePrice);
    }
}