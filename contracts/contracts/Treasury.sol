pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract Treasury is OwnableUpgradeable{
    
    function initialize() initializer public {
        __Ownable_init();
    }

    function sendMatic(address to,uint amount) public onlyOwner{
        payable(to).transfer(amount);
    }

    function sendERC20(address token,address to,uint amount) public onlyOwner{
        IERC20(token).transfer(to,amount);
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    receive() external payable {}
    fallback() external payable{}
}