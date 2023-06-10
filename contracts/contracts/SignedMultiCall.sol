pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract SignedMultiCall {
    struct Transaction {
        bytes32 hash;
        uint8 v;
        bytes32 r;
        bytes32 s;
        uint256 value;
        address to;
        uint256 nonce;
    }

    mapping(bytes32 => bool) public usedNonces;
    mapping(bytes32 => Transaction) public transactions;

    function executeTransactions(Transaction[] memory txs, bytes[] memory data) public {
        require(txs.length == data.length, "Array lengths must match");

        for (uint i = 0; i < txs.length; i++) {
            Transaction memory tx1 = txs[i];

            // Verify that the nonce has not been used before
            bytes32 hash = keccak256(abi.encodePacked(address(this), tx1.nonce, data[i]));
            require(!usedNonces[hash], "Nonce already used");

            // Verify the signature
            // address signer = ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", tx1.hash)), tx1.v, tx1.r, tx1.s);
            // console.log("Signer: %s", signer);
            // console.log("Sender: %s", msg.sender);
            // require(signer == msg.sender, "Invalid signature");

            // Mark the nonce as used
            usedNonces[hash] = true;

            // Execute the transaction
            (bool success,) = tx1.to.call{value: tx1.value}(data[i]);
            require(success, "Transaction failed");

            // Store the transaction for future reference
            transactions[tx1.hash] = tx1;
        }
    }

    function broadcastTransaction(address from, bytes memory signedTx) public returns (bool) {
        (bool success, bytes memory ret) = address(from).call(signedTx);
        // require(success, "Transaction broadcast failed");

        _processDelegateCallResult(success, ret, "Transaction failed");
        return true;
    }

    function _processDelegateCallResult(bool success, bytes memory data, string memory fallbackError) private pure {
        if (success) {
            return;
        }

        if (data.length > 0) {
            assembly {
                let returnDataSize := mload(data)
                revert(add(32, data), returnDataSize)
            }
        } else {
            revert(fallbackError);
        }
    }
}