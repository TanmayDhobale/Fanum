# HODL Project

A Solana program for locking tokens for a specified period.

## Deployment

This contract is currently deployed on the Solana testnet.

## Contract Address

Testnet: `HDSDejM9dQ549FaWeGhbZeEEHpdRcU4Wz1TPeB2yBFQF`

## Features

- Initialize HODL account
- Deposit tokens
- Withdraw tokens after lock period
- Partial withdrawals
- Pause/Unpause functionality (admin only)


## Usage

1. Initialize a HODL account
2. Deposit tokens into the account
3. Tokens are locked for 10 years
4. After the lock period, tokens can be withdrawn

## Development

Built using Anchor framework version 0.30.1.

## To build:

anchor build

## To test:

anchor test --provider.cluster testnet


## Security

This contract has not been audited and is not ready for mainnet deployment.



