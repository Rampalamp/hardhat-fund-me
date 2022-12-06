// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
//import from github
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    //library functions should be internal
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // Need ABI
        // Need Address of contract 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e

        //no longer need to hardcode in the AggregatorV3Interface, it is being set in the constructor, based on the params when deployed.

        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // );

        //(uint80 roundId, int256 price, uint startedAt, uint timeStamp, uint80 answeredInRound) = priceFeed.latestRoundData();
        //OR if we just want price...
        (, int price, , , ) = priceFeed.latestRoundData();
        //ETH in terms of USD
        //this will have only 8 decimal places, but msg.value will have 18, so different units currently.
        //so on the return simply ** 10
        //msg.value is also a uint256 not int256, need to convert. typecasting exists in solidity, you cannot type cast anything, but some types like int256 to uint256 OK
        return uint256(price * 1e10); // 1**10
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        //always multiple before division in solidity.
        return (ethPrice * ethAmount) / 1e18; // should result in conversion to USD;
    }

    // function getVersion() internal view returns (uint256) {
    //     return
    //         AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e)
    //             .version();
    // }
}
