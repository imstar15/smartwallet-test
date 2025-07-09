//Now that we have designated a Contract onto the Account, we can interact with it by invoking its functions.
//Note that we no longer need to use an Authorization!

import { eoa } from './config/eoa'
import { walletClient } from './config/relay'
import { abi } from './contract'

const main = async () => {
	const hash = await walletClient.writeContract({
		abi,
		address: eoa.address, 
		functionName: 'ping', 
	})

	console.log("hash: ", hash);
}

main();
