// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
pragma experimental ABIEncoderV2;

import "./Deliverables.sol";
import "./Ownable.sol";
// tomorrow:
// Add functionality of owning a product - ar
//modifier to check that only owner can perform transaction- yg

// Take care of adding actor via pharmaAdmin - sa & ak






contract deploySupplyChain{

    uint public minimumCharge = 0.0000001 ether;

    event deployedNewContract (address contractAddress); 

    function deploy(uint _minimum) payable public {
        require(_minimum >= minimumCharge);
        address newSupplyChain =  address(new SupplyChain(msg.sender));
        emit deployedNewContract(newSupplyChain);

    }

}

contract SupplyChain {

    address public pharmaAdmin;
    address public deliverablesAddr;

    // enum roles{supplier,manufacturer,transporter,distributor,provider}


    struct Actor{
        address actorAddr;
        string name;
        string role;
        bool exists;
    }


    mapping(address=>Actor) public actorAddrToRole;
    
    mapping(string=>Actor) public actorNameToRole; // when the input from the dropdown is translated to; the function can find the relevant actor
    
    //mapping(address=>bool) public actorAddrInChain;


    //find a way to not have too many people spam
    constructor(address _pharmaAdmin ) {
        pharmaAdmin = _pharmaAdmin;
    }


    modifier onlyPharmaAdmin {
        require(msg.sender == pharmaAdmin);
        _;
    }

    modifier onlyActor {
        require(actorAddrToRole[msg.sender].exists==true);
        _;
    }

    //modifier onlyOwner {
    //    require(msg.sender == getOwnerOfDeliverables());
    //   _;
    //}

    // Solved - write a function - accept an array of addre and resepctive roles. for each loop addActor func will called for each of those tupples
    // [(addr,role1),(addr,role2)]

    //Solved - individually addr role will be passed for each entity


    
    function addActor(address _actorAddr,string memory _role,string memory _name)public onlyPharmaAdmin {
        
        Actor memory actor = Actor({
            actorAddr:_actorAddr,
            name:_name,
            role:_role,
            exists:true
        });
        
        actorAddrToRole[_actorAddr] = actor;
    }

    function getActorfromMapping(address _actorAddr) public view returns(Actor memory){
        return actorAddrToRole[_actorAddr];
    }


    event deliverablesCreated(address _deliverablesAddr);


    function createDeliverables(string memory _description) public onlyActor{
        address deployDeliverables = address(new Deliverables(_description,actorAddrToRole[msg.sender].role,msg.sender));
        deliverablesAddr = deployDeliverables;
        emit deliverablesCreated(deliverablesAddr);
    }
    
    

    function createProduct(string memory _description,uint _quantity) public onlyActor {
        Deliverables d = Deliverables(deliverablesAddr);
        d.createProduct(msg.sender,_description,_quantity);
    }


    function getOwnerOfDeliverables() public view returns(address){
        Deliverables p = Deliverables(deliverablesAddr);
        address ret = p.getOwner();
        return ret;
    }

    function shipDeliverables(address destinationOwner) public {
        Deliverables p = Deliverables(deliverablesAddr);
        p.shipDeliverables(msg.sender,destinationOwner, actorAddrToRole[destinationOwner].role);
    }

    function transformProduct(string memory _description, uint _quantity) public{
        Deliverables d = Deliverables(deliverablesAddr);
        d.transformProduct(msg.sender,_description, _quantity);
        // 
        // clear from mapping
        // event
    }

    //function shipProduct(source address (current owner) , destination address(next owner) , parameters ) onlyOwner {
        // target the product contract and retireve the data

        // - change status, source and destination (more fine details) , timestamp, shipping details
    //}


    // append this product to an mapping; manufacturer will access the element ; run a receiveShipment fn ; that element will be removed from array.








    // function for transforming product eg: eth -> crocin onlyProductOwner
        // input - the variables from that instance of the Product contract (meaning get the public address).
                    // the new information that is to be replaced. 
                    // define an event that can capture the transformation details. and emits it in the function. 




                    //frntend - take ids, make calls serially, call the transform fn n times from the web3 library.

                    //each time we have an id, we pass id - mp[id] , then perfom operations




                    // description = "";
                    // for id in array: des = mp[id].description;
                    //                  description+=des;

    

    // 1] define a funtion in the supply chain to transfer product ownership and change the status - product and shipments
            // - take arbitary name like transporter and be able to get the corresponding address



    
    
    
    
    // solidity - web3 frontend - 

    // web3 - access the product contract separately, retrieve the data, and we run the ship product function separately using that data
    


}