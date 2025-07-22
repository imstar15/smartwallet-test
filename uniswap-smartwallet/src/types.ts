export interface Call {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}

export interface BatchedCall {
  calls: Call[];
  revertOnFailure: boolean;
}

export enum UniversalRouterCommand {
  V3_SWAP_EXACT_IN = 0x00,
  SWEEP = 0x04,
  PAY_PORTION = 0x06,
  WRAP_ETH = 0x0b,
}
