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

![image](https://github.com/user-attachments/assets/e1fb1f62-24de-4f8d-a9c0-9806905c245f)

![image](https://github.com/user-attachments/assets/5cd101d1-85ca-4be0-9b45-df1e1447cfe3)

![image](https://github.com/user-attachments/assets/9f788846-ea11-4c11-b3e2-90e5924772b0)

![image](https://github.com/user-attachments/assets/33236f74-95fe-47aa-b633-b609ab6e5880)



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



