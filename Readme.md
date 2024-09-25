# HODL Project

A Solana program for locking tokens for a specified period.

## Deployment

This contract is currently deployed on the Solana devnet.

## Contract Address

Devnet: `Cs3zUdBmUuo8jFzmtQUAtTHtK7ZKpnK75mfTFDYbLsWt`

## Features

- Initialize HODL account
- Deposit tokens
- Withdraw tokens after lock period
- Partial withdrawals
- Pause/Unpause functionality (admin only)
- Staking rewards based on lock duration

## Usage

1. Initialize a HODL account
2. Deposit tokens into the account
3. Tokens are locked for 10 years by default
4. After the lock period, tokens can be withdrawn along with earned rewards

## Development

Built using Anchor framework version 0.30.1.

## To build:

anchor build

## To test:

anchor test --provider.cluster devnet

## To deploy:

anchor deploy --provider.cluster devnet

## Security

This contract has not been audited and is not ready for mainnet deployment.



