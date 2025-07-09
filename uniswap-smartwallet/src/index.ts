// ✅ Calibur EIP-7702 Ping Demo using viem + @uniswap/smart-wallet-sdk
import { createPublicClient, http, encodeFunctionData, parseUnits, encodeAbiParameters, keccak256, toHex  } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { SmartWallet } from '@uniswap/smart-wallet-sdk';

const OWNER_PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = "https://smartwallet-sepolia.uniswap.org";
const ENTRYPOINT_ADDRESS = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";
const PING_CONTRACT_ADDRESS = '0x4FabEC92C893F9168C8142C2b5a9B1dB8D247fcc';

export function getUserOperationHashV08(userOp: {
  sender: `0x${string}`;
  nonce: bigint;
  initCode: `0x${string}`;
  callData: `0x${string}`;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: `0x${string}`;
}) {
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'sender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'initCode', type: 'bytes' },
        { name: 'callData', type: 'bytes' },
        { name: 'callGasLimit', type: 'uint256' },
        { name: 'verificationGasLimit', type: 'uint256' },
        { name: 'preVerificationGas', type: 'uint256' },
        { name: 'maxFeePerGas', type: 'uint256' },
        { name: 'maxPriorityFeePerGas', type: 'uint256' },
        { name: 'paymasterAndData', type: 'bytes' },
      ],
      [
        userOp.sender,
        userOp.nonce,
        userOp.initCode,
        userOp.callData,
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        userOp.maxFeePerGas,
        userOp.maxPriorityFeePerGas,
        userOp.paymasterAndData,
      ]
    )
  );
}

// --- Create and send the UserOperation ---
async function sendUserOp() {
  const account = privateKeyToAccount(OWNER_PRIVATE_KEY);
  const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

  // --- Encode ping() call ---
  const pingAbi = [
    {
      type: 'function',
      name: 'ping',
      stateMutability: 'pure',
      inputs: [],
      outputs: []
    }
  ];

  const pingData = encodeFunctionData({
    abi: pingAbi,
    functionName: 'ping',
    args: []
  });

  const call = {
    to: PING_CONTRACT_ADDRESS,
    value: 0n,
    data: pingData,
  };

  // --- Encode batched call through Calibur ---
  const { calldata } = SmartWallet.encodeBatchedCall([call]);

  const userOp = {
    sender: account.address,
    callData: calldata,
    callGasLimit: toHex(1_000_000n),
    verificationGasLimit: toHex(1_000_000n),
    preVerificationGas: toHex(100_000n),
    maxFeePerGas: toHex(parseUnits('20', 'gwei')),
    maxPriorityFeePerGas: toHex(parseUnits('1', 'gwei')),
    paymasterAndData: '0x',
    nonce: toHex(0n),
    initCode: '0x',
    signature: '0x', // placeholder
  };

  const userOpHash = getUserOperationHashV08(userOp);

  const signature = await account.signMessage({ message: { raw: userOpHash } });

  const signedUserOp = {
    ...userOp,
    signature,
  };

  const result = await publicClient.request({
    method: 'eth_sendUserOperation',
    params: [signedUserOp, ENTRYPOINT_ADDRESS],
  });
  console.log('UserOperation sent. Hash:', result);
}

sendUserOp().catch(console.error);
