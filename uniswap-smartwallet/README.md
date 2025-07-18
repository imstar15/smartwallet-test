# Testing for Unitswap Calibur contract.

1. Register a key and make a transfer WETH with alternative signer account.

  ```
  export EOA_KEY=0xEoaKey
  export SIGNER_KEY=0xSignerKey
  yarn run transfer
  ```

2. Swap ETH for UNI using an alternative signer account.

  ```
  export EOA_KEY=0xEoaKey
  export SIGNER_KEY=0xSignerKey
  yarn run swap
  ```
