import { createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

if (!process.env.RELAY_PK) {
  throw new Error('RELAY_PK is not set');
}

// The relayer account.
// The relayer account is the account that will be used to sign the authorization and the transaction.
// We will need to set up a Client and a "Relay Account" that will be responsible for executing the EIP-7702 Contract Write.
// In this demo, we will be using a "Relay Account" (not the EOA) to execute the Transaction.
// This is typically how EIP-7702 is used in practice, as the relayer can sponsor the gas fees to perform the Transaction.
export const relay = privateKeyToAccount(process.env.RELAY_PK as `0x${string}`);

// The wallet client for the relayer account.
export const walletClient  = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
});
