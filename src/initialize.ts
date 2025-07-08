import { privateKeyToAccount } from 'viem/accounts';
import { abi, contractAddress } from './contract';
import { walletClient } from './config';

const eoa = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const main = async () => {
  // 1. Authorize designation of the Contract onto the EOA.
  const authorization = await walletClient.signAuthorization({ 
    account: eoa, 
    contractAddress,
  });

  console.log("authorization: ", authorization);
  
  // 2. Designate the Contract on the EOA, and invoke the `initialize` function.
  const hash = await walletClient.writeContract({ 
    abi, 
    address: eoa.address,
    authorizationList: [authorization],  //3. Pass the Authorization as a parameter.
    functionName: "initialize",
  });

  console.log("hash: ", hash);
}

main();
