import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

if (!process.env.PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not set')
}
 
export const relay = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
 
export const walletClient = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
});
