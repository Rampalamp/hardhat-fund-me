const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
    console.log("verifying contract...");
    //hardhat lets you use commands like functions, so below will run the verify task as if i were to do yarn hardhat verify.
    //the verify task takes parameters, and you can see them if you were to run - yarn hardhat verify --help - we will see it takes a "verify" param.
    //its more of a subtask of the task verify though, as the run() command also takes parameters after the main task name parameter.
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("ALready Verified!");
        } else {
            console.log(error);
        }
    }
};

module.exports = { verify };
