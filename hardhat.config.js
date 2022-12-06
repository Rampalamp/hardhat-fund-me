require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    //can add multiple solidity versions when dealing with legacy contracts etc.
    //solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
            {
                version: "0.8.9",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545/",
            accounts: [
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            ],
            chainId: 31337,
            blockConfirmations: 3,
        },
        hardhat: {
            blockGasLimit: 4245000000,
            gas: "auto",
        },
    },
    gasReporter: {
        enabled: true,
        //currency: "USD",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
};
