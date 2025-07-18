import { createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

if (!process.env.SENDER_PK) {
  throw new Error('SENDER_PK is not set');
}

// The sender account is the account that will be used to send the transaction.
export const sender = privateKeyToAccount(process.env.SENDER_PK as `0x${string}`);

// The wallet client for the sender account.
export const walletClient  = createWalletClient({
  account: sender,
  chain: sepolia,
  transport: http(),
});
