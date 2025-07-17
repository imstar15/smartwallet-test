export interface Call {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}

export interface BatchedCall {
  calls: Call[];
  revertOnFailure: boolean;
}

export enum Command {
  WRAP_ETH = 0x0b,
  V3_SWAP_EXACT_IN = 0x00,
}
