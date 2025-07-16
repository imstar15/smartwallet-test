import { encodeFunctionData, parseEther, toHex } from 'viem';
import { walletClient } from './config/eoa';
import { abi, contractAddress } from './config/contract';

interface Call {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}

interface BatchedCall {
  calls: Call[];
  revertOnFailure: boolean;
}

async function main() {
  const WETH = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';
  const UNI  = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
  const UNIVERSAL_ROUTER   = '0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b'; // Universal Router (Sepolia)
  const AMOUNT = parseEther('0.01');

  // 1. wrap ETH -> WETH
  const wrapCmd = 0x0b; // WRAP_ETH opcode :contentReference[oaicite:5]{index=5}
  const wrapInput = encodeFunctionData({
    abi: [
      { name: 'wrapETH', type: 'function', inputs: [{ name: 'amount', type: 'uint256' }] },
      {
        "type": "error",
        "name": "InsufficientETH",
        "inputs": [
          {
            "name": "reason",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      },
    ],
    functionName: 'wrapETH',
    args: [AMOUNT],
  });

  // 2. swap WETH -> UNI 使用 V3 exact input
  const swapCmd = 0x00; // V3_SWAP_EXACT_IN opcode :contentReference[oaicite:6]{index=6}
  const path = encodeFunctionData({
    abi: [{ name: 'path', type: 'function', inputs: [{ name: '', type: 'bytes' }] }],
    functionName: 'path',
    args: [ 
      // 路径为 WETH → UNI via fee 3000, 手写拼接 bytes: WETH(20) + fee(3) + UNI(20)
      `${WETH.slice(2)}${Number(3000).toString(16).padStart(6,'0')}${UNI.slice(2)}`
    ],
  });

  const swapInput = encodeFunctionData({
    abi: [{
      name: 'v3SwapExactIn',
      type: 'function',
      inputs: [
        { name: 'recipient', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMin', type: 'uint256' },
        { name: 'path', type: 'bytes' },
        { name: 'payerIsSender', type: 'bool' },
      ]
    }],
    functionName: 'v3SwapExactIn',
    args: [walletClient.account.address, AMOUNT, 0n, path, true],
  });

  // 3. Build execute parameters
  const commands = Uint8Array.from([wrapCmd, swapCmd]);
  const inputs = [wrapInput, swapInput];

  const swapCall: Call = {
    to: UNIVERSAL_ROUTER,
    value: AMOUNT,
    data: encodeFunctionData({
      abi: [{
        "inputs": [
          { "internalType": "bytes", "name": "commands", "type": "bytes" },
          { "internalType": "bytes[]", "name": "inputs", "type": "bytes[]" }
        ],
        "name": "execute",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }],
      functionName: 'execute',
      args: [toHex(commands), inputs],
    }),
  };

  const batchedCall: BatchedCall = { calls: [swapCall], revertOnFailure: true };

  const authorization = await walletClient.signAuthorization({ contractAddress: contractAddress, executor: 'self' });
  const hash = await walletClient.writeContract({
    abi,
    address: walletClient.account.address,
    functionName: 'execute',
    args: [batchedCall],
    authorizationList: [authorization],
    value: AMOUNT,
  });

  console.log("hash: ", hash);
}

main().catch(console.error);