import { Account, Chain, encodeAbiParameters, keccak256, parseEventLogs, Transport, WalletClient } from "viem";
import { BatchedCall } from "./types";
import { abi, contractAddress } from './config/calibur';
import { publicClient } from "./config/public";
import { contractAddress as hookAddress } from './config/hook';
interface RegisterParams {
  signerAddress: `0x${string}`;
  eoaClient: WalletClient<Transport, Chain, Account>;
}

interface SetHookParams {
  keyHash: `0x${string}`;
  eoaClient: WalletClient<Transport, Chain, Account>;
}

interface ExecuteWithKeyParams {
  eoaAddress: `0x${string}`;
  batchedCall: BatchedCall;
  value?: bigint;
  signerClient: WalletClient<Transport, Chain, Account>;
}

// Register an admin key for the signer address and return the keyHash.
export const register = async ({ signerAddress, eoaClient } : RegisterParams): Promise<`0x${string}`> => {
  // Create a public key for the signer address.
  const encodedAddress = encodeAbiParameters(
    [{ name: 'addr', type: 'address' }],
    [signerAddress]
  );

  // KeyType 2 is secp256k1.
  const key = { keyType: 2, publicKey: encodedAddress };

  const authorization = await eoaClient.signAuthorization({
    contractAddress,
    executor: 'self',
  });

  const registerHash = await eoaClient.writeContract({
    abi,
    address: eoaClient.account.address,
    functionName: 'register',
    args: [key],
    authorizationList: [authorization],
  });

  console.log('Key registered successfully. Tx hash:', registerHash);

  // Wait for the registration transaction to be confirmed.
  console.log('Waiting for the registration transaction to be confirmed...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash: registerHash });
  console.log('Confirmed at block:', receipt.blockNumber.toString());

  const registeredEventAbi = {
    type: 'event',
    name: 'Registered',
    inputs: [
      { name: 'keyHash', type: 'bytes32', indexed: true },
      {
        name: 'key',
        type: 'tuple',
        components: [
          { name: 'keyType', type: 'uint8' },
          { name: 'publicKey', type: 'bytes' },
        ],
        indexed: false,
      },
    ],
  };

  const logs = parseEventLogs({
    abi: [registeredEventAbi],
    logs: receipt.logs,
    eventName: 'Registered',
  }) as unknown as { eventName: string; args: { keyHash: `0x${string}` } }[];

  const keyHash = logs.find((log) => log.eventName === 'Registered')?.args.keyHash as `0x${string}`;

  console.log('✅ Registered keyHash:', keyHash);

  return keyHash;
}

export const setHook = async ({ keyHash, eoaClient } : SetHookParams): Promise<`0x${string}`> => {
  // Construct settings
  const isAdmin = true;
  const expiration = 0; // 永不过期
  const hookBigInt = BigInt(hookAddress);
  const adminFlag = isAdmin ? 1n << 200n : 0n;
  const expirationShifted = expiration > 0 ? BigInt(expiration) << 160n : 0n;
  const settings = hookBigInt | expirationShifted | adminFlag;

  // Call update()
  const hash = await eoaClient.writeContract({
    abi,
    address: eoaClient.account.address,
    functionName: 'update',
    args: [keyHash, settings],
  });

  console.log('Hook set successfully. Tx hash:', hash);
  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

// Execute a batched call
export const execute = async ({ eoaAddress, batchedCall, value, signerClient } : ExecuteWithKeyParams): Promise<`0x${string}`> => {
  const hash = await signerClient.writeContract({
    abi,
    address: eoaAddress,
    functionName: 'execute',
    args: [batchedCall],
    value,
  });

  return hash;
}
