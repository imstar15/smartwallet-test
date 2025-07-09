import { abi, contractAddress } from './contract';
import { eoa } from './config/eoa';
import { walletClient } from './config/relay';

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
