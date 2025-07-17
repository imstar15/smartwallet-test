import { encodeAbiParameters, encodeFunctionData, parseEther } from 'viem';
import { BatchedCall, Call } from './types';
import { WETH } from './contants';
import { publicClient } from './config/public';
import { walletClient as eoaClient } from './config/eoa';
import { walletClient as relayClient } from './config/relay';
import { abi, contractAddress } from './config/contract';

const RECIPIENT_ADDRESS = '0x409fE4Ab95b2604910a3ca27989c70D459C3851A';
const TRANSFER_AMOUNT = parseEther('0.001');

const main = async () => {
  console.log('1. Registering key...');

  // Create a public key for the relay account.
  const encodedAddress = encodeAbiParameters(
    [{ name: 'addr', type: 'address' }],
    [relayClient.account.address]
  );
  // KeyType 2 is secp256k1.
  const key = { keyType: 2, publicKey: encodedAddress };

  const authorization = await eoaClient.signAuthorization({
    contractAddress,
    executor: 'self',
  });

  const registerHash = await eoaClient.writeContract({
    abi,
    address: eoaClient.account.address,
    functionName: 'register',
    args: [key],
    authorizationList: [authorization],
  });

  console.log('Key registered successfully. Tx hash:', registerHash);

  // Wait for the registration transaction to be confirmed.
  console.log('Waiting for the registration transaction to be confirmed...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash: registerHash });
  console.log('Confirmed at block:', receipt.blockNumber.toString());
  
  console.log("2. Transfer WETH...");

  const depositCall: Call = {
    to: WETH,
    value: TRANSFER_AMOUNT,
    data: encodeFunctionData({
      abi: [{
        name: 'deposit',
        type: 'function',
        stateMutability: 'payable',
        inputs: [],
        outputs: [],
      }],
      functionName: 'deposit',
    }),
  };

  const transferData = encodeFunctionData({
    abi: [{
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
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
  
  const eoaAuthorization = await relayClient.signAuthorization({
    account: eoaClient.account,
    contractAddress,
  });

  const hash = await relayClient.writeContract({
    abi,
    address: eoaClient.account.address,
    functionName: 'execute',
    args: [batchedCall],
    authorizationList: [eoaAuthorization],
    value: TRANSFER_AMOUNT,
  });

  console.log("WETH transferred successfully. Tx hash:", hash);
};

main().catch(console.error);