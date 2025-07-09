# EIP-7702 Test

Smart contract deployment test project.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Test ETH on Sepolia

## Quick Start

1. **Install Foundry**
```bash
brew install foundry
```

2. **Compile contract**
```bash
forge build
```

3. **Deploy to Sepolia**
```bash
export PRIVATE_KEY=0xPrivateKey

forge create --broadcast --rpc-url https://ethereum-sepolia-rpc.publicnode.com --private-key $PRIVATE_KEY src/contracts/Delegation.sol:Delegation
```

## Contract Functions

- `initialize()` - Emits "Hello, world!"
- `ping()` - Emits "Pong!"

## Test

**1. Setup environment variables**

**Relayer account:**

The relayer account is the account that will be used to sign the authorization and the transaction.

We will need to set up a Client and a "Relay Account" that will be responsible for executing the EIP-7702 Contract Write.

In this demo, we will be using a "Relay Account" (not the EOA) to execute the Transaction.

This is typically how EIP-7702 is used in practice, as the relayer can sponsor the gas fees to perform the Transaction.

**EOA account:**

The EOA account(Smart wallet) to be delegated to the contract. 

```
export EOA_PK=0xEoaPrivateKey
export RELAYER_PRIVATE_KEY=0xRelayerPrivateKey
```

**2. Authorize designation of the Contract onto the EOA and initialize the contract.**

```
yarn run init
```

**3. Invoking its functions without an Authorization.**

```
yarn run ping
```


## Get Test ETH

- [Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

That's it! 🚀
