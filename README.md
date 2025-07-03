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

## Get Test ETH

- [Sepolia Faucet](https://sepoliafaucet.com/)

That's it! 🚀
