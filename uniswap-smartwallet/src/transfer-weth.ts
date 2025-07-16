
import { encodeFunctionData, parseEther } from 'viem';
import { walletClient } from './config/eoa';
import { abi, contractAddress } from './config/contract';

interface Call {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}

interface BatchedCall {
  calls: Call[];
  revertOnFailure: boolean;
}

const RECIPIENT_ADDRESS = '0x409fE4Ab95b2604910a3ca27989c70D459C3851A';

const TRANSFER_AMOUNT = parseEther('0.001');

const WETH = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';

const main = async () => {
  const depositCall: Call = {
    to: WETH,
    value: TRANSFER_AMOUNT,
    data: encodeFunctionData({
      abi: [{ name: 'deposit', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] }],
      functionName: 'deposit',
    }),
  };

  const transferData = encodeFunctionData({
    abi: [{
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to',  type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
    }],
    functionName: 'transfer',
    args: [RECIPIENT_ADDRESS, TRANSFER_AMOUNT],
  });

  const transferCall: Call = {
    to: WETH,
    value: 0n,
    data: transferData,
  };

  const batchedCall: BatchedCall = {
    calls: [depositCall, transferCall],
    revertOnFailure: true,
  };


  // Authorize designation of the Contract onto the EOA.
  const authorization = await walletClient.signAuthorization({ 
    contractAddress,
    executor: 'self',
  });

  console.log("authorization: ", authorization);

  const hash = await walletClient.writeContract({
    abi,                               // Delegated 合约的 ABI
    address: walletClient.account.address,
    functionName: 'execute',
    args: [batchedCall],
    authorizationList: [authorization],
    value: TRANSFER_AMOUNT,
  });

  console.log("hash: ", hash);
}

main();
