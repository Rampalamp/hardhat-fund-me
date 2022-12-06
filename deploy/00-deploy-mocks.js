const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("local network detected, deploying mocks...");

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            //constructor of MockV3Aggregator takes a decimal and initial answer. (what is pricefeed starting at)
            args: [DECIMALS, INITIAL_ANSWER],
        });

        log("Mocks Deployed!");
        log("--------------------------------------------");
    }
};
//tags let you specify which deploy what you want to do, : yarn hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"];
