import { encodeAbiParameters, encodeFunctionData, parseAbiParameters, parseEther, toHex } from 'viem';
import { BatchedCall, Call, UniversalRouterCommand } from './types';
import { WETH, UNI, UNIVERSAL_ROUTER } from './contants';
import { walletClient } from './config/eoa';
import { abi, contractAddress } from './config/contract';

// Address of this contract in the Universal Router.
const ADDRESS_THIS = '0x0000000000000000000000000000000000000002';
// Fee recipient.
const FEE_RECIPIENT = '0xe49acc3b16c097ec88dc9352ce4cd57ab7e35b95';
// Amount of WETH to swap.
const AMOUNT = parseEther('0.001');

async function main() {
  // Create wrapETH input
  const wrapEthInput = encodeAbiParameters(
    parseAbiParameters('address recipient, uint256 amount'),
    [
      ADDRESS_THIS,
      AMOUNT,
    ]
  );

  // Create v3SwapExactIn input.
  const pathBytes = `0x${WETH.slice(2)}${Number(100).toString(16).padStart(6, '0')}${UNI.slice(2)}` as `0x${string}`;
  const v3SwapExactInInput = encodeAbiParameters(
    parseAbiParameters('address recipient, uint256 amountIn, uint256 amountOutMin, bytes path, bool payerIsSender'),
    [
      ADDRESS_THIS,
      AMOUNT,
      0n,
      pathBytes,
      false,
    ]
  );

  // Create payPortion input.
  const payPortionInput = encodeAbiParameters(
    parseAbiParameters('address token, address recipient, uint256 bips'),
    [
      UNI,
      FEE_RECIPIENT,
      25n,
    ]
  );

  // Create sweep input.
  const sweepInput = encodeAbiParameters(
    parseAbiParameters('address token, address recipient, uint160 amountMin'),
    [
      UNI,
      walletClient.account.address,
      0n
    ]
  );

  // Create commands and inputs.
  const commands = Uint8Array.from([UniversalRouterCommand.WRAP_ETH, UniversalRouterCommand.V3_SWAP_EXACT_IN, UniversalRouterCommand.PAY_PORTION, UniversalRouterCommand.SWEEP]);
  const inputs = [wrapEthInput, v3SwapExactInInput, payPortionInput, sweepInput];

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