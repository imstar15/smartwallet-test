import { Account, Chain, encodeAbiParameters, parseEventLogs, PublicClient, Transport, WalletClient } from "viem";
import { BatchedCall } from "./types";
import { abi, executeWithSignatureAbi, contractAddress } from './config/calibur';
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

interface ExecuteParams {
  eoaAddress: `0x${string}`;
  batchedCall: BatchedCall;
  value?: bigint;
  signerClient: WalletClient<Transport, Chain, Account>;
}

interface ExecuteWithSignatureParams {
  eoaAddress: `0x${string}`;
  keyHash: `0x${string}`;
  batchedCall: BatchedCall;
  value?: bigint;
  signerClient: WalletClient<Transport, Chain, Account>;
  senderClient: WalletClient<Transport, Chain, Account>;
}

interface SignedBatchedCall {
  executor: `0x${string}`;
  batchedCall: BatchedCall;
  keyHash: `0x${string}`;
  nonce: bigint;
  deadline: bigint;
}

interface CreateSignedBatchedCallParams {
  eoaAddress: `0x${string}`;
  keyHash: `0x${string}`;
  batchedCall: BatchedCall;
  executor: `0x${string}`;
}

const createSignedBatchedCall = async ({ eoaAddress, keyHash, batchedCall, executor } : CreateSignedBatchedCallParams): Promise<SignedBatchedCall> => {
  const key = BigInt("0x" + keyHash.slice(2, 50));

  const seq = await publicClient.readContract({
    address: eoaAddress,
    abi,
    functionName: 'getSeq',
    args: [key]
  }) as unknown as bigint;

  const nonce = (key << 64n) | seq;

  const signedBatchedCall = {
    executor,
    batchedCall,
    keyHash,
    nonce,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 300),
  };

  return signedBatchedCall;
}

export const getWrappedSignature = async ({
  eoaAddress,
  signedBatchedCall,
  signerClient,
  publicClient,
}: {
  eoaAddress: `0x${string}`;
  signedBatchedCall: {
    executor: `0x${string}`;
    batchedCall: BatchedCall;
    keyHash: `0x${string}`;
    nonce: bigint;
    deadline: bigint;
  };
  signerClient: WalletClient<Transport, Chain, Account>;
  publicClient: PublicClient;
}): Promise<`0x${string}`> => {
  const eip712Domain = await publicClient.readContract({
    address: eoaAddress,
    abi,
    functionName: 'eip712Domain',
  });

  const [_fields, name, version, chainId, verifyingContract, salt] = eip712Domain as unknown as [
    string,
    string,
    string,
    bigint,
    `0x${string}`,
    `0x${string}`
  ];

  const domain = { name, version, chainId, verifyingContract, salt };

  const signature = await signerClient.signTypedData({
    domain,
    types: {
      SignedBatchedCall: [
        { name: 'batchedCall', type: 'BatchedCall' },
        { name: 'nonce', type: 'uint256' },
        { name: 'keyHash', type: 'bytes32' },
        { name: 'executor', type: 'address' },
        { name: 'deadline', type: 'uint256' },
      ],
      BatchedCall: [
        { name: 'calls', type: 'Call[]' },
        { name: 'revertOnFailure', type: 'bool' },
      ],
      Call: [
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' },
      ],
    },
    primaryType: 'SignedBatchedCall' as const,
    message: signedBatchedCall,
  });

  const wrappedSignature = encodeAbiParameters(
    [
      { type: 'bytes' },
      { type: 'bytes' }
    ],
    [signature, '0x']
  );

  return wrappedSignature;
};

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
export const execute = async ({ eoaAddress, batchedCall, value, signerClient } : ExecuteParams): Promise<`0x${string}`> => {
  const hash = await signerClient.writeContract({
    abi,
    address: eoaAddress,
    functionName: 'execute',
    args: [batchedCall],
    value,
  });

  return hash;
}

export const executeWithSignature = async ({ eoaAddress, keyHash, batchedCall, value, signerClient, senderClient } : ExecuteWithSignatureParams): Promise<`0x${string}`> => {
  // Create a signed batched call
  const signedBatchedCall = await createSignedBatchedCall({ eoaAddress, keyHash, batchedCall, executor: senderClient.account.address });

  // Get the wrapped signature
  const wrappedSignature = await getWrappedSignature({ eoaAddress, signedBatchedCall, signerClient, publicClient });

  // Send the transaction by the sender client
  const hash = await senderClient.writeContract({
    abi: executeWithSignatureAbi,
    address: eoaAddress,
    functionName: 'execute',
    args: [signedBatchedCall, wrappedSignature],
    value,
  });

  return hash;
}
