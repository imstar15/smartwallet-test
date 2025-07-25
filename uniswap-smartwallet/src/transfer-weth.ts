import { encodeFunctionData, parseEther } from 'viem';
import { BatchedCall, Call } from './types';
import { WETH } from './contants';
import { walletClient as eoaClient } from './config/eoa';
import { walletClient as signerClient } from './config/signer';
import { walletClient as senderClient } from './config/sender';
import { executeWithSignature, register, setHook } from './calibur';

const RECIPIENT_ADDRESS = '0x409fE4Ab95b2604910a3ca27989c70D459C3851A';
const TRANSFER_AMOUNT = parseEther('0.001');

const main = async () => {
  console.log('1. Registering an alternative signer...');

  const keyHash = await register({ eoaClient, signerAddress: signerClient.account.address });

  console.log('2. Setting hook...');

  await setHook({ eoaClient, keyHash });
  
  console.log("3. Transfer WETH...");

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

  const hash = await executeWithSignature({ eoaAddress: eoaClient.account.address, keyHash, batchedCall, signerClient, senderClient });

  console.log("WETH transferred successfully. Tx hash:", hash);
};

main().catch(console.error);