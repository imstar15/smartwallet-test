import { encodeAbiParameters, encodeFunctionData, parseAbiParameters, parseEther, toHex } from 'viem';
import { BatchedCall, Call, Command } from './types';
import { WETH, UNI, UNIVERSAL_ROUTER } from './contants';
import { walletClient } from './config/eoa';
import { abi, contractAddress } from './config/contract';

// Amount of WETH to swap.
const AMOUNT = parseEther('0.001');

async function main() {
  // Create wrapETH input
  const wrapEthInput  = encodeAbiParameters(
    parseAbiParameters('address recipient, uint256 amount'),
    [
      '0x0000000000000000000000000000000000000002',
      AMOUNT,
    ]
  );

  // Create v3SwapExactIn input.
  const pathBytes = `0x${WETH.slice(2)}${Number(100).toString(16).padStart(6, '0')}${UNI.slice(2)}` as `0x${string}`;
  const v3SwapExactInInput  = encodeAbiParameters(
    parseAbiParameters('address recipient, uint256 amountIn, uint256 amountOutMin, bytes path, bool payerIsSender'),
    [
      '0x0000000000000000000000000000000000000002',
      AMOUNT,
      0n,
      pathBytes,
      false,
    ]
  );

  // Create commands and inputs.
  const commands = Uint8Array.from([Command.WRAP_ETH, Command.V3_SWAP_EXACT_IN]);
  const inputs = [wrapEthInput, v3SwapExactInInput];

  // Create swap call.
  const swapCall: Call = {
    to: UNIVERSAL_ROUTER,
    value: AMOUNT,
    data: encodeFunctionData({
      abi: [{
        name: 'execute',
        type: 'function',
        inputs: [
          { name: 'commands', type: 'bytes' },
          { name: 'inputs', type: 'bytes[]' },
          { name: 'deadline', type: 'uint256' }
        ],
        stateMutability: 'payable',
      }],
      functionName: 'execute',
      args: [toHex(commands), inputs, Math.floor(Date.now() / 1000) + 300],
    }),
  };

  // Create batched call.
  const batchedCall: BatchedCall = { calls: [swapCall], revertOnFailure: true };

  console.log("Sending transaction to Universal Router...");
  
  // Create authorization for EIP-7702.
  const authorization = await walletClient.signAuthorization({ contractAddress, executor: 'self' });

  // Write contract with EIP-7702 and Calibur.
  const hash = await walletClient.writeContract({
    abi,
    address: walletClient.account.address,
    functionName: 'execute',
    args: [batchedCall],
    authorizationList: [authorization],
    value: AMOUNT,
  });

  console.log("Tx hash: ", hash);
}

main().catch(console.error);