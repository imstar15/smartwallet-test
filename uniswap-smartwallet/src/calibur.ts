import { Account, Chain, encodeAbiParameters, Transport, WalletClient } from "viem";
import { BatchedCall } from "./types";
import { abi, contractAddress } from './config/calibur';
import { publicClient } from "./config/public";

interface RegisterParams {
  eoaClient: WalletClient<Transport, Chain, Account>;
  signerClient: WalletClient<Transport, Chain, Account>;
}

interface ExecuteWithKeyParams {
  eoaClient: WalletClient<Transport, Chain, Account>;
  signerClient: WalletClient<Transport, Chain, Account>;
  batchedCall: BatchedCall;
  value?: bigint;
}

// Register an admin key for the sender account.
export const register = async ({ eoaClient, signerClient } : RegisterParams): Promise<`0x${string}`> => {
  // Create a public key for the sender account.
  const encodedAddress = encodeAbiParameters(
    [{ name: 'addr', type: 'address' }],
    [signerClient.account.address]
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

  return registerHash;
}

// Execute a batched call
export const execute = async ({ eoaClient, signerClient, batchedCall, value } : ExecuteWithKeyParams): Promise<`0x${string}`> => {
  const eoaAuthorization = await signerClient.signAuthorization({
    account: eoaClient.account,
    contractAddress,
  });

  const hash = await signerClient.writeContract({
    abi,
    address: eoaClient.account.address,
    functionName: 'execute',
    args: [batchedCall],
    authorizationList: [eoaAuthorization],
    value,
  });

  return hash;
}
