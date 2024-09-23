use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("HDSDejM9dQ549FaWeGhbZeEEHpdRcU4Wz1TPeB2yBFQF");

#[program]
pub mod hodl_project {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let user_deposit = &mut ctx.accounts.user_deposit;
        let clock = Clock::get()?;

        require!(amount > 0, ErrorCode::InvalidAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;


        user_deposit.owner = ctx.accounts.authority.key();
        user_deposit.amount += amount;
        user_deposit.deposit_timestamp = clock.unix_timestamp;
        user_deposit.unlock_timestamp = clock.unix_timestamp + 10 * 365 * 24 * 60 * 60; // 10 years

        emit!(DepositEvent {
            user: ctx.accounts.authority.key(),
            amount,
            unlock_timestamp: user_deposit.unlock_timestamp,
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let user_deposit = &mut ctx.accounts.user_deposit;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= user_deposit.unlock_timestamp,
            ErrorCode::LockPeriodNotEnded
        );

        let amount = user_deposit.amount;


        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                &[&[
                    b"vault",
                    user_deposit.owner.as_ref(),
                    &[ctx.bumps.vault],
                ]],
            ),
            amount,
        )?;


        user_deposit.amount = 0;

        emit!(WithdrawEvent {
            user: ctx.accounts.authority.key(),
            amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Deposit<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8,
        seeds = [b"user_deposit", authority.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"user_deposit", authority.key().as_ref()],
        bump,
        constraint = user_deposit.owner == authority.key() @ ErrorCode::UnauthorizedWithdrawal,
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct UserDeposit {
    pub owner: Pubkey,
    pub amount: u64,
    pub deposit_timestamp: i64,
    pub unlock_timestamp: i64,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub unlock_timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid deposit amount")]
    InvalidAmount,
    #[msg("Lock period has not ended yet")]
    LockPeriodNotEnded,
    #[msg("Unauthorized withdrawal attempt")]
    UnauthorizedWithdrawal,
}