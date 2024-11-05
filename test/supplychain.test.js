const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const options = {
    gasLimit: 10000000,
};
const web3 = new Web3(ganache.provider(options));

const compiledDeploySupplyChain = require('../build/deploySupplyChain.json');
const compiledSupplyChain = require('../build/SupplyChain.json');
const compiledDeliverables = require("../build/Deliverables.json");
let accnts;
let deploySupplyChain;
let SupplyChainAddr;
let SupplyChain;

beforeEach( async ()=>{
    accnts = await web3.eth.getAccounts();
    // console.log(accnts);
    //console.log(await web3.eth.getBalance(accnts[0]));
    //console.log("____________________");

    deploySupplyChain = await new web3.eth.Contract(compiledDeploySupplyChain.abi)
        .deploy({data :compiledDeploySupplyChain.evm.bytecode.object})
        .send({ from: accnts[0], gas:'10000000'});

    await deploySupplyChain.methods.deploy(web3.utils.toWei('0.0000001','ether')).send({
        from: accnts[1],
        gas: '10000000'
    });

    const event = await deploySupplyChain.getPastEvents('deployedNewContract',{fromBlock:0,toBlock:'latest'});

    SupplyChainAddr = event[0].returnValues.contractAddress;

    SupplyChain = await new web3.eth.Contract(compiledSupplyChain.abi,SupplyChainAddr);


});

describe('Supply Chain',()=>{
    it('deploys a factory',()=>{
        assert.ok(deploySupplyChain.options.address);
        assert.ok(SupplyChain.options.address);
    });

    it('assigns admin role to correct account',async()=>{
        const admin = await SupplyChain.methods.pharmaAdmin().call();
        assert.equal(accnts[1], admin);
    });

    it('adds an actor',async()=>{
        await SupplyChain.methods.addActor(accnts[2],"supplier","XYZ").send({
            from:accnts[1],
            gas:'1000000'
        })
        const actor = await SupplyChain.methods.getActorfromMapping(accnts[2]).call();
        assert.equal(accnts[2],actor.actorAddr);
    });

    it('creates deliverables', async()=>{
        await SupplyChain.methods.addActor(accnts[2],"supplier","XYZ").send({
            from:accnts[1],
            gas:'1000000'
        });
        await SupplyChain.methods.createDeliverables("description").send({
            from:accnts[2],
            gas:'10000000'
        });
        const event = await SupplyChain.getPastEvents('deliverablesCreated',{fromBlock:0,toBlock:'latest'});
        deliverablesAddress = event[0].returnValues._deliverablesAddr;
        const dAddr = await SupplyChain.methods.deliverablesAddr().call();
        assert.equal(deliverablesAddress,dAddr);

    });

    it('assigns correct address to owner of deliverables', async()=>{
        await SupplyChain.methods.addActor(accnts[2],"supplier","XYZ").send({
            from:accnts[1],
            gas:'1000000'
        });
        await SupplyChain.methods.createDeliverables("description").send({
            from:accnts[2],
            gas:'10000000'
        });
        const dOwner = await SupplyChain.methods.getOwnerOfDeliverables().call();
        assert.equal(accnts[2],dOwner);
    });

    it('creates product', async()=> {

        await SupplyChain.methods.addActor(accnts[2],"supplier","XYZ").send({
            from:accnts[1],
            gas:'1000000'
        });
        await SupplyChain.methods.createDeliverables("description").send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.createProduct("Ethanol",120).send({
            from:accnts[2],
            gas:'10000000'
        });

        const dAddr = await SupplyChain.methods.deliverablesAddr().call();
        Deliverables = await new web3.eth.Contract(compiledDeliverables.abi,dAddr);
    
        const event = await Deliverables.getPastEvents('productCreated',{fromBlock:0,toBlock:'latest'});
        
        const product = await Deliverables.methods.getProductFromProductID(event[0].returnValues.productId).call();
    
        assert.equal(product.id,event[0].returnValues.productId);

    });

    it('ships product to corresponding actor',async()=>{
        await SupplyChain.methods.addActor(accnts[2],"supplier","XYZ").send({
            from:accnts[1],
            gas:'1000000'
        });
        await SupplyChain.methods.createDeliverables("description").send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.createProduct("Ethanol",120).send({
            from:accnts[2],
            gas:'10000000'
        });

        await SupplyChain.methods.addActor(accnts[3],"manufacturer","ABC").send({
            from:accnts[1],
            gas:'1000000'
        });

        const dAddr = await SupplyChain.methods.deliverablesAddr().call();
        Deliverables = await new web3.eth.Contract(compiledDeliverables.abi,dAddr);
    
        //const event = await Deliverables.getPastEvents('productCreated',{fromBlock:0,toBlock:'latest'});
        
        //const product = await Deliverables.methods.getProductFromProductID(event[0].returnValues.productId).call();
    
        await SupplyChain.methods.shipDeliverables(accnts[3]).send({
            from:accnts[2],
            gas:'1000000'
        });

        const event = await Deliverables.getPastEvents('shipedDeliverables',{fromBlock:0,toBlock:'latest'});
        assert.equal(event[0].returnValues.destinationOwner,await SupplyChain.methods.getOwnerOfDeliverables().call());

    });

    it('transforms product(s) to another product',async()=>{
        await SupplyChain.methods.addActor(accnts[2],"supplier","XYZ").send({
            from:accnts[1],
            gas:'1000000'
        });
        await SupplyChain.methods.createDeliverables("description").send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.createProduct("Ethanol",120).send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.createProduct("Benzene",150).send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.addActor(accnts[3],"manufacturer","ABC").send({
            from:accnts[1],
            gas:'1000000'
        });

        const dAddr = await SupplyChain.methods.deliverablesAddr().call();
        Deliverables = await new web3.eth.Contract(compiledDeliverables.abi,dAddr);
    
    
        await SupplyChain.methods.shipDeliverables(accnts[3]).send({
            from:accnts[2],
            gas:'1000000'
        });


        await SupplyChain.methods.transformProduct("Crocin",100).send({
            from:accnts[3],
            gas:'1000000'
        });

        const event = await Deliverables.getPastEvents('transformedProduct',{fromBlock:0,toBlock:'latest'});
        assert.ok(event[0].returnValues.time);

    })

    it('can throw entire event chain of the supply chain',async()=>{
        await SupplyChain.methods.addActor(accnts[2],"supplier","XYZ").send({
            from:accnts[1],
            gas:'1000000'
        });
        await SupplyChain.methods.createDeliverables("description").send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.createProduct("Ethanol",120).send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.createProduct("Benzene",150).send({
            from:accnts[2],
            gas:'10000000'
        });
        await SupplyChain.methods.addActor(accnts[3],"manufacturer","ABC").send({
            from:accnts[1],
            gas:'1000000'
        });

        const dAddr = await SupplyChain.methods.deliverablesAddr().call();
        Deliverables = await new web3.eth.Contract(compiledDeliverables.abi,dAddr);
    
    
        await SupplyChain.methods.shipDeliverables(accnts[3]).send({
            from:accnts[2],
            gas:'1000000'
        });


        await SupplyChain.methods.transformProduct("Crocin",100).send({
            from:accnts[3],
            gas:'1000000'
        });

        const event = await Deliverables.getPastEvents({fromBlock:0,toBlock:'latest'});
        assert.ok(event)
        // event.forEach((element,index) => {
        //     console.log(index,element.event,element.returnValues)
        // });
    })

});