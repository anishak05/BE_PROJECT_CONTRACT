// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Ownable 
{    
  // Variable that maintains 
  // owner address
  address public _owner;
  string public _role;

  modifier onlyTxOrigin() {
    require(tx.origin==_owner,"Function accessible only by the orignal address that initiated the chain of calls");
    _;
  }
  
  // Sets the original owner of 
  // contract when it is deployed
  constructor()
  {
    _owner = msg.sender;
  }
  
  // Publicly exposes who is the
  // owner of this contract
  function getOwner() public view returns(address) 
  {
    return _owner;
  }
  
  // onlyOwner modifier that validates only 
  // if caller of function is contract owner, 
  // otherwise not
  modifier onlyOwner() 
  {
    require(isOwner(),
    "Function accessible only by the owner !!");
    _;
  }
  
  // function for owners to verify their ownership. 
  // Returns true for owners otherwise false
  function isOwner() public view returns(bool) 
  {
    return msg.sender == _owner;
  }
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  
  function _transferOwnership(address newOwner) onlyOwner internal virtual {
    address oldOwner = _owner;
    _owner = newOwner;
    emit OwnershipTransferred(oldOwner, newOwner);
  }

  function _transferOwnershipFromOrigin(address newOwner) onlyTxOrigin internal virtual {
    address oldOwner = _owner;
    _owner = newOwner;
    emit OwnershipTransferred(oldOwner, newOwner);
  }


}