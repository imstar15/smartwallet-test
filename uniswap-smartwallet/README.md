# Testing for Unitswap Calibur contract.

The following examples demonstrate the Calibur invocation flow, including key registration and the `LoggingHook` contract.

1. Register a key and Swap ETH for UNI using an alternative signer.
    ```
    export EOA_PK=0xEoaKey
    export SIGNER_PK=0xSignerKey
    yarn run swap
    ```

1. Register a key and make a transfer WETH with alternative signer.

    In this case, an API with the wrappedSignature parameter is used. wrappedSignature is a signature based on the EIP-712 standard.
  
    ```
    function execute(SignedBatchedCall calldata signedBatchedCall, bytes calldata wrappedSignature) public payable;

    ```

    The process is as follows:

    - The user's EOA (Externally Owned Account) delegates to a contract to add the signer's public key.

    - The signer constructs and signs the transaction, specifying the sender as the executor.

    - The sender submits the transaction on-chain and pays the gas fee.

    ```
    export EOA_PK=0xEoaKey
    export SIGNER_PK=0xSignerKey
    export SENDER_PK=0xSenderKey
    yarn run transfer
    ```
