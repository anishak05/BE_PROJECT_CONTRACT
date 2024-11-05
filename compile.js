const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');


// Fetch path of build
const buildPath = path.resolve(__dirname, "build");
const contractPath = path.resolve(__dirname, "contracts");

// Removes folder build and every file in it
fs.removeSync(buildPath);

// Fetch all Contract files in Contracts folder
const fileNames = fs.readdirSync(contractPath);

const compilerInput = {
    language: "Solidity",
    sources: fileNames.reduce((input, fileName) => {
      const filePath = path.resolve(contractPath, fileName);
      const source = fs.readFileSync(filePath, "utf8");
      return { ...input, [fileName]: { content: source } };
    }, {}),
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  function findImports(relativePath) {
    //my imported sources are stored under the node_modules folder!
    const absolutePath = path.resolve(__dirname, 'node_modules', relativePath);
    const source = fs.readFileSync(absolutePath, 'utf8');
    return { contents: source };
  }
  
  // Compile All contracts
  const compiled = JSON.parse(solc.compile(JSON.stringify(compilerInput),{import:findImports}));
  
  fs.ensureDirSync(buildPath);

  console.log(compiled)
  
  fileNames.map((fileName) => {
    const contracts = Object.keys(compiled.contracts[fileName]);
    contracts.map((contract) => {
      fs.outputJsonSync(
        path.resolve(buildPath, contract + ".json"),
        compiled.contracts[fileName][contract]
      );
    });
  });