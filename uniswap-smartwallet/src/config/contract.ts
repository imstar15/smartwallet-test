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
    "name": "Unauthorized",
    "inputs": []
  },
 ];
 
 export const contractAddress = '0x000000009B1D0aF20D8C6d0A44e162d11F9b8f00';
