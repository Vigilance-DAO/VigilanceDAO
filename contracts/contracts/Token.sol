pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract Token is ERC20Upgradeable, OwnableUpgradeable {

    uint public MAX_SUPPLY;

    function initialize(string memory _name, 
        string memory _symbol) initializer public {
        __ERC20_init(_name, _symbol);
        __Ownable_init();
        MAX_SUPPLY = 1000000000 ether; // 1B
    }

    function mint(address to, uint quantity) public onlyOwner {
        require(totalSupply() + quantity <= MAX_SUPPLY, "Exceeding max supply");
        _mint(to, quantity);
    }
}