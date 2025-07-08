//Now that we have designated a Contract onto the Account, we can interact with it by invoking its functions.
//Note that we no longer need to use an Authorization!

import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './config'
import { abi } from './contract'
 
const eoa = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const main = async () => {
	const hash = await walletClient.writeContract({
		abi,
		address: eoa.address, 
		functionName: 'ping', 
	})

	console.log("hash: ", hash);
}

main();
