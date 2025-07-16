import { keccak256, toBytes, slice } from 'viem';

/**
 * 获取函数选择器（4-byte selector）
 * @param signature Solidity 函数签名，例如 "transfer(address,uint256)"
 * @returns 4-byte 选择器，例如 "0xa9059cbb"
 */
export const getFunctionSelector = (signature: string): `0x${string}` => {
  try {
    const hash = keccak256(toBytes(signature));
    const selector = slice(hash, 0, 4);
    return selector;
  } catch (err) {
    throw new Error(`Invalid signature: ${signature}`);
  }
};

const signatures = [
  'execute(((address,uint256,bytes)[],bool))',              // BatchedCall ✅
  'execute((tuple[],bool,uint256,bytes32,address,uint256),bytes)', // SignedBatchedCall ✅
  'execute(bytes32, bytes)',                                 // Plugin 执行器 ✅
];

for (const sig of signatures) {
  const selector = getFunctionSelector(sig);
  console.log(`${sig} → ${selector}`);
}