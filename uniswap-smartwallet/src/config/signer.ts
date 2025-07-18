import { createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

if (!process.env.SIGNER_PK) {
  throw new Error('SIGNER_PK is not set');
}

// The signer account is the account that will be used to send the transaction.
export const signer = privateKeyToAccount(process.env.SIGNER_PK as `0x${string}`);

// The wallet client for the signer account.
export const walletClient  = createWalletClient({
  account: signer,
  chain: sepolia,
  transport: http(),
});
