pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury {
    
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }


    function sendMatic(address to,uint amount) public onlyOwner{
        payable(to).transfer(amount);
    }

    function sendERC20(address token,address to,uint amount) public onlyOwner{
        IERC20(token).transfer(to,amount);
    }

    receive() external payable {}

    fallback() external payable{}
}