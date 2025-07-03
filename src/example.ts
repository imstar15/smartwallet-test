import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './config'
import { abi, contractAddress } from './contract'
 
const eoa = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`) 
 
const authorization = await walletClient.signAuthorization({ 
  account: eoa, 
  contractAddress, 
});

console.log("authorization: ", authorization);
 
const hash = await walletClient.writeContract({ 
  abi, 
  address: eoa.address, 
  authorizationList: [authorization], 
  functionName: 'initialize', 
});

console.log("hash: ", hash);
