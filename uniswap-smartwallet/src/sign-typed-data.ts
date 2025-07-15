import { sepolia } from 'viem/chains';
import {
  privateKeyToAccount,
  type PrivateKeyAccount,

} from 'viem/accounts'
import {
  createWalletClient,
  http,
  type WalletClient,
  toHex,
  pad,
} from 'viem'

import { DOMAIN_NAME, DOMAIN_VERSION, types, SignedBatchedCall, InputData, DEFAULT_DOMAIN_SALT} from './utils/constants';

interface SignedBatchedCallInputData extends InputData {
  signedBatchedCall: SignedBatchedCall;
}

// Read command line arguments
// const args = process.argv.slice(2);
// if (args.length < 1) {
//   console.log("Usage: sign-typed-data <privateKey> <verifyingContract> <calls>");
//   process.exit(1);
// }

// Parse the JSON input
// const jsonInput = JSON.parse(args[0]) as SignedBatchedCallInputData;
// const { privateKey, verifyingContract, signedBatchedCall, prefixedSalt } = jsonInput;
const privateKey = "0x......";
const verifyingContract = "0x......"
const signedBatchedCall = {
  "calls": [],
  "signature": "0x..."
};
const prefixedSalt = "0x0000000000000000000000000000000000000000000000000000000000000000";

const account = privateKeyToAccount(pad(toHex(BigInt(privateKey))));

// Define the domain type structure
const domain = {
  name: DOMAIN_NAME,
  version: DOMAIN_VERSION,
  chainId: 31337, // Default Anvil chain ID
  verifyingContract,
  salt: prefixedSalt
} as const;

// Create a wallet client
const walletClient: WalletClient = createWalletClient({
  account,
  transport: http(sepolia.rpcUrls.default.http[0])
});

async function signTypedData(): Promise<void> {
  try {
    const signature = await walletClient.signTypedData({
      account,
      domain,
      types,
      primaryType: 'SignedBatchedCall',
      message: signedBatchedCall
    });
    
    console.log("signature: ", signature);
  } catch (error) {
    console.error('Error signing typed data:', error);
    process.exit(1);
  }
}

signTypedData().catch(console.error); 