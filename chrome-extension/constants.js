const abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "domain",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isScam",
          "type": "bool"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "reporter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "createdOn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "evidences",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "comments",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "stakeAmount",
          "type": "uint256"
        }
      ],
      "name": "Reported",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "domain",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isScam",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "reporter",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "updatedon",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "validatorComments",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "status",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        }
      ],
      "name": "Validated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_governanceBadgeNFT",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_tokenContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_treasuryContract",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "domain",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isScam",
          "type": "bool"
        }
      ],
      "name": "isReported",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lockedAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "domain",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isScam",
          "type": "bool"
        },
        {
          "internalType": "string[]",
          "name": "evidenceHashes",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "comments",
          "type": "string"
        }
      ],
      "name": "report",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reportID",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reward",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "rewardContributors",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_reportReward",
          "type": "uint256"
        }
      ],
      "name": "setReportReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_reward",
          "type": "uint256"
        }
      ],
      "name": "setReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_stakingAmount",
          "type": "uint256"
        }
      ],
      "name": "setStakingAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "stakingAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_reportId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isAccepted",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "comments",
          "type": "string"
        }
      ],
      "name": "validate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

const address = "0x68Db62ADCaADdb21cB000841f1F347A6d8bEED9b"

// for production
const API_ENDPOINT = "https://api.vigilancedao.org"
const DOMAIN = 'https://vigilancedao.org'

// for development
// const API_ENDPOINT = "http://localhost:4000";
// const DOMAIN = "http://localhost:3000";

const USER_ID_KEY = "user-id";

module.exports = {
	abi,
	address,
	API_ENDPOINT,
	DOMAIN,
	USER_ID_KEY,
};
