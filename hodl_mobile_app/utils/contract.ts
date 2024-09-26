import {   SystemProgram , PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3  } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from 'bn.js';
import idl from '../idl/hodl_project.json';

declare const window: Window & typeof globalThis;
const programId = new PublicKey('Cs3zUdBmUuo8jFzmtQUAtTHtK7ZKpnK75mfTFDYbLsWt');

export const getProgram = () => {
  const provider = new AnchorProvider(
    new web3.Connection('https://api.devnet.solana.com'),
    (typeof window !== 'undefined' && 'solana' in window ? (window as any).solana : null),
    AnchorProvider.defaultOptions()
  );
  return new Program(idl as any, programId, provider);
};

export const createDepositInstruction = async (walletPubkey: PublicKey, amount: number) => {
  const program = getProgram();
  const [userDepositPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('user_deposit'), walletPubkey.toBuffer()],
    program.programId
  );

  const [vaultPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('vault'), walletPubkey.toBuffer()],
    program.programId
  );

  return program.instruction.deposit(
    new BN(amount),
    {
      accounts: {
        state: program.programId,
        userDeposit: userDepositPDA,
        userTokenAccount: walletPubkey,
        vault: vaultPDA,
        authority: walletPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const createWithdrawInstruction = async (walletPubkey: PublicKey) => {
  const program = getProgram();
  const [userDepositPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('user_deposit'), walletPubkey.toBuffer()],
    program.programId
  );

  const [vaultPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('vault'), walletPubkey.toBuffer()],
    program.programId
  );

  const [rewardVaultPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('reward_vault')],
    program.programId
  );

  return program.instruction.withdraw(
    {
      accounts: {
        state: program.programId,
        userDeposit: userDepositPDA,
        userTokenAccount: walletPubkey,
        vault: vaultPDA,
        rewardVault: rewardVaultPDA,
        authority: walletPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  );
};

export const getBalance = async () => {
  const program = getProgram();
  const provider = program.provider as AnchorProvider;
  const balance = await provider.connection.getBalance(provider.wallet.publicKey);
  return balance / 1e9; 
};