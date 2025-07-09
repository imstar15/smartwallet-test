import { privateKeyToAccount } from 'viem/accounts';

if (!process.env.EOA_PK) {
  throw new Error('EOA_PK is not set');
}

// The EOA account to be delegated to the contract.
// Smart wallet.
export const eoa = privateKeyToAccount(process.env.EOA_PK as `0x${string}`);
