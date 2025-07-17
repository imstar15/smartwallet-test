export interface Call {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}

export interface BatchedCall {
  calls: Call[];
  revertOnFailure: boolean;
}
