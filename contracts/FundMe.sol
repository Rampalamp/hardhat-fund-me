//get funds from users
//withdraw funds
//set a min funding value in USD

//general solidity style guide
//pragma
//imports
//errors
//interfaces,libraries
//contracts

// SPDX-License-Identifier: MIT
//pragma
pragma solidity ^0.8.7;
//imports
import "./PriceConverter.sol";
import "../node_modules/hardhat/console.sol";

//constant, immutable help reduce gas in the case where the variable are only ever set once.

//859 757 gas to create
//error codes
error FundMe__NotOwner();

//error FundMe__NeedMoreEth();

//solidity style guides do exist, docs.soliditylang.org

//interfaces,libraries

//documentation specifics below, using these lets us use following command : solc --userdoc --devdoc ex1.sol
//which will automatically generate documentation for us.
/**@title A contract for crowd funding
 * @author Pantz
 * @notice This contract is to learnnnn
 * @dev This implements price feeds as library
 *
 */
contract FundMe {
    //style guide order of contract
    //Type Declarations
    //State variables
    //Events
    //Modifiers
    //Functions

    //library PriceConverter used - cool way to apply a library to a base type of solidity.
    //TYPE DECLARATION
    using PriceConverter for uint256;

    //STATE VARIABLES
    //uint256 public minimumUSD = 50;
    //need to give minUSD 18 decimal places to match the returned conversion rate.
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    //immutable will also be more gas efficient, as it stores the data in the bytecode of the contract
    //immutable variables can be set ONE time in the constructor.
    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    //MODIFIERS
    modifier onlyOwner() {
        //having underscore above the require would tell the withdraw function to do all the code, then check the require statement
        //_;
        //require(msg.sender == owner, "Sender is not owner");
        //having the udnerscore below the required means the required is the first check before any code execution on the withdraw function.
        //using NotOwner() custom error results in less gas on function run.
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    //below modifier implementation basically breaks all the tests... no idea why, lulz.
    // modifier needMoreEth() {
    //     if (msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD) {
    //         revert FundMe__NeedMoreEth();
    //     }
    //     _;
    // }

    //Functions Order:
    //constructor
    //receive
    //fallback
    //external
    //public
    //internal
    //private
    //view / pure

    //constructor functions are immediately called when a contract is deployed, preventing us from having to do a second transaction to set owernship etc.
    constructor(address priceFeedAddress) {
        //in this case msg.sender would be who ever deployed the contract.
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //what happens if someone sends this contract ETH without calling the fund function
    //first setup it would simply not keep track of who sent the rogue ETH.
    //catch the random transfer with no calldata, and call fund() anyway
    receive() external payable {
        fund();
    }

    //if someone sends eth with bad CALLDATA then we can accept the amount and call fund() again.
    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     *
     */
    function fund() public payable {
        //want to be able to set a minimum fund amount in USD
        //1.How do we send ETH to this contract?
        //value is in wei amount.
        //msg.value in this case is considered the first parameter of the library functions, which is why we dont need a parameter directly inside
        //getConversionRate(uint256). we can have a second parameter in in getConversationRate and still do something like msg.value.getConversionRate(uint256 secondParam)
        //it is actually cheaper gas to make a custom error object and use revert inside a modifier

        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "didnt send enough"
        );

        //require(getConversionRate(msg.value) > minimumUSD, "didnt send enough");// 1e18 = 1 * 10 ** 18 == 1000000000000000000

        //Reverting - undo any action BEFORE,  and send remaining gas back.
        //any code executed before the failed require statement still causes GAS to get used, WHILE ALSO BEING UNDONE/REVERTED
        //any code after the failing require does not get computed, and the remaining gas gets sent back since its unused.

        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        //require(msg.sender == owner, "Sender is not owner");
        console.log("beginning for loop");

        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            //resetting balance of amount to 0
            s_addressToAmountFunded[funder] = 0;
        }
        //reset the array

        //0 specifies the new array starts with 0 elements.
        s_funders = new address[](0);

        //withdraw funds.

        //transfer
        //sender is an address type, so we must wrap it in payable.

        //payable(msg.sender).transfer(address(this).balance);

        //send

        //bool sendSuccess = payable(msg.sender).send(address(this).balance);

        //require(sendSuccess, "Send failed");

        //call
        //(bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");
        //as of recording june/may2022 Call is the recommended way to send/recieve either.
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");

        //revert can be called anywhere to undo what was done
        //revert();
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        //mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
