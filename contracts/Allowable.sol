// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Allowable {
    mapping(address => bool) private _allowed;

    constructor() {
        _allowed[msg.sender] = true;
    }

    modifier isAllowed {
        require(_allowed[msg.sender] == true);
        _;
    }

    function hasAccess(address _address) public view isAllowed returns (bool) {
        return(_allowed[_address] == true);
    }

    function allowAccess(address _address) public isAllowed {
        _allowed[_address] = true;
    }

    function denyAccess(address _address) public isAllowed {
        delete _allowed[_address];
    }
}