export const abi = [
	{
    name: 'execute',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'batchedCall',
        type: 'tuple',
        components: [
          {
            name: 'calls',
            type: 'tuple[]',
            components: [
              { name: 'to', type: 'address' },
              { name: 'value', type: 'uint256' },
              { name: 'data', type: 'bytes' },
            ],
          },
          { name: 'revertOnFailure', type: 'bool' },
        ],
      },
    ],
    outputs: [],
  },
  {
    "type": "function",
    "name": "register",
    "inputs": [
      {
        "name": "key",
        "type": "tuple",
        "internalType": "struct Key",
        "components": [
          {
            "name": "keyType",
            "type": "uint8",
            "internalType": "enum KeyType"
          },
          {
            "name": "publicKey",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "update",
    "inputs": [
      {
        "name": "keyHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "settings",
        "type": "uint256",
        "internalType": "Settings"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "error",
    "name": "Unauthorized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CallFailed",
    "inputs": [
      {
        "name": "reason",
        "type": "bytes",
        "internalType": "bytes"
      }
    ]
  },
  {
    "type": "error",
    "name": "CannotUpdateRootKey",
    "inputs": []
  },
  {
    "type": "error",
    "name": "KeyDoesNotExist",
    "inputs": []
  },
 ];
 
 export const contractAddress = '0x000000009B1D0aF20D8C6d0A44e162d11F9b8f00';
