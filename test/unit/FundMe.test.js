const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");
          beforeEach(async function() {
              //deploy fundme contract using hardhat deploy
              deployer = (await getNamedAccounts()).deployer;
              // const accounts = ethers.getSigners();
              // const accountZero = accounts[0];

              //deployments.fixture you can use the tags to run through/deploy all contracts with that associated tag.
              //so this will run the 00-deploy-mocks.js and 01-deploy-fund-me.js
              await deployments.fixture(["all"]);

              fundMe = await ethers.getContract("FundMe", deployer);

              mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
          });

          describe("constructor", async function() {
              it("sets the aggregator addresses correctly", async function() {
                  const response = await fundMe.getPriceFeed();

                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", async function() {
              it("Fails if you don't send enough ETH", async function() {
                  //below is a way of testing require() functions in solidity
                  //we expect this to fail, and can even check for specific failure codes.
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "didnt send enough"
                  );

                  //failed implementation of a custom error message, no idea why. breaks all the other tests as well...
                  // await expect(fundMe.fund()).to.be.revertedWithCustomError(
                  //     fundMe,
                  //     "FundMe__NeedMoreEth"
                  // );
              });

              it("Updates the amount funded data structure", async function() {
                  await fundMe.fund({ value: sendValue });

                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );

                  assert.equal(response.toString(), sendValue.toString());
              });

              it("Adds funder to array of funders", async function() {
                  await fundMe.fund({ value: sendValue });

                  const funder = await fundMe.getFunders(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", async function() {
              //contract needs funding before we can run withdraw tests, setup a beforeEach
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraw ETH from a single funder", async function() {
                  //Arrange the test
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );
                  //Act

                  const transactionResponse = await fundMe.withdraw();

                  const transactionReceipt = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //gasCost

                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows us to withdraw with multiple funders", async function() {
                  //arrange
                  const accounts = await ethers.getSigners();

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );

                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //gasCost

                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //also make sure funders are reset properly.
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("Only allows the owner to withdraw", async function() {
                  const accounts = await ethers.getSigners();

                  const attackerConnectedContract = await fundMe.connect(
                      accounts[1]
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });

              it("cheaperWithdraw testing...", async function() {
                  //arrange
                  const accounts = await ethers.getSigners();

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );

                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //gasCost

                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //also make sure funders are reset properly.
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
          });
      });
