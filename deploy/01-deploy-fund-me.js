//hardhat deploy is a little different then the normal way

// function deployFunc(hre){
//     console.log("hi");
// }

// module.exports.default = deployFunc;
//below is more or less identical as above.

// module.exports = async (hre) => {
//     //pull out some hre variables we plant o use.
//     const {getNamedAccounts, deployments}= hre;

// }

const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

//can also extrapolate out the variables in the paramater section
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    //what happens when we want to change chains...
    // if(chainId === "31337"){

    // }
    // else{

    // }
    //can grab/determine which address you need to use depending on which chain/network the contract is being deployed on.
    //good way to reduce accidental deployments with wrong addresses.

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const ethUsdAggreggator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggreggator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    //We use mocks in the scenario where we dont want to use a testnet address, but a localhost address or a network that doesnt have a price feed contract.

    //when going for localhost or hardhat network we want to use a mock

    const args = [ethUsdPriceFeedAddress];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    //if NOT deploying to a development chain, this is where we can setup the auto verifications of the solidity code.
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify code
        await verify(fundMe.address, args);
    }

    log("----------------------------");
};

module.exports.tags = ["all", "fundme"];

//If we use yarn hardhat node, it will spin up the new node WITH all of these deployed contracts/script already setup on it. niceee.
