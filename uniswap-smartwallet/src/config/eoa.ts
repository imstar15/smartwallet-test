import { createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

if (!process.env.EOA_PK) {
  throw new Error('EOA_PK is not set');
}

export const eoa = privateKeyToAccount(process.env.EOA_PK as `0x${string}`);

// The wallet client for the EOA account.
export const walletClient  = createWalletClient({
  account: eoa,
  chain: sepolia,
  transport: http(),
});
