const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledDeploySupplyChain = require('./build/deploySupplyChain.json');

const provider = new HDWalletProvider(
  //metamask phrase,
  
  //infura endpoint
  
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(compiledDeploySupplyChain.abi)
    .deploy({ data: compiledDeploySupplyChain.evm.bytecode.object })
    .send({ from: accounts[0] });

  
  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();

