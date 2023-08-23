// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {
    constructor() ERC20("Wrapped Ether", "WETH") {}

    function mint(address reciever, uint256 amount) public {
        _mint(reciever, amount);
    }

    function burn(address owner, uint256 amount) public {
        _burn(owner, amount);
    }
}
