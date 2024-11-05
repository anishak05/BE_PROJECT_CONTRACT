// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Deliverables is Ownable {


    
    string pDescription;
    address deliverablesId;
    string public description;
    string ownerRole;


    struct Product{
        bytes32 id;
        string description;
        uint quantity;
    }

    uint iteration = 0;

    mapping (uint => mapping (bytes32 => Product))public productIdToProduct;

   


    //find a way to define what role the current owner has


    // find a way to transfer owner to another address and update the role


    //modifier to check that only owner can perform transaction




    constructor(
        string memory _description,
        string memory _role,
        address newOwner
    ){
        ownerRole = _role;
        deliverablesId = address(this);
        description = _description;
        _transferOwnership(newOwner);
    }

    event productCreated(bytes32 productId,string _description,uint _quantity);

    function createProduct(address caller,string memory _description,uint _quantity) public {
        
        require(caller==getOwner());
        bytes32 hashId = keccak256(abi.encodePacked(_description,_quantity,block.timestamp));
        Product memory p = Product({
            id:hashId,
            description:_description,
            quantity:_quantity
        });
        // add description and quantity together, and then append it to the global var description
        pDescription = string.concat(pDescription," , ",_description," of ",Strings.toString(_quantity)," units") ;
        productIdToProduct[iteration][hashId] = p;
        emit productCreated(hashId,_description,_quantity);
    }

    event shipedDeliverables(address currentOwner, address destinationOwner, uint time, string pDescription);

    function shipDeliverables(address currentOwner, address destinationOwner, string memory _destinationRole) public {
        require(currentOwner == getOwner());
        _transferOwnershipFromOrigin(destinationOwner);
        ownerRole = _destinationRole;
        emit shipedDeliverables(currentOwner, destinationOwner, block.timestamp, getPDescription());

    }

    event transformedProduct(string fdescription, uint time, string transformedProduct, uint transformedProductQuantity);

    function transformProduct(address caller, string memory _description, uint _quantity) public {
        string memory fdescription = getPDescription();
        // create product 
        iteration += 1;
        clearPDescription();
        createProduct(caller,_description,_quantity);
        emit transformedProduct(fdescription, block.timestamp, _description, _quantity);
    }

    function getPDescription() public view returns(string memory){
        return pDescription;
    }

    function clearPDescription() private {
        pDescription = " ";
    }

    function getproductId(bytes32 _id) public view returns (bytes32) {
        return productIdToProduct[iteration][_id].id;
    }

    function getRole() public view returns (string memory) {
        return ownerRole;
    }

    function transferProductOwnership(address _newOwner) public {
        _transferOwnership(_newOwner);
    }  

    function getProductFromProductID(bytes32 id) public view returns(Product memory){
        return productIdToProduct[iteration][id];
    }

}