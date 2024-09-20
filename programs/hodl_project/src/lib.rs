use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("your_program_id");

#[program]
pub mod hodl_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let hodl_account = &mut ctx.accounts.hodl_account;
        hodl_account.authority = ctx.accounts.authority.key();
        hodl_account.total_deposits = 0;
        hodl_account.paused = false;
        hodl_account.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.hodl_account.paused, ErrorCode::ContractPaused);

        let hodl_account = &mut ctx.accounts.hodl_account;
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
        user_deposit.unlock_timestamp = clock.unix_timestamp + 10 * 365 * 24 * 60 * 60;

        hodl_account.total_deposits += amount;
        hodl_account.last_updated = clock.unix_timestamp;

        emit!(DepositEvent {
            user: ctx.accounts.authority.key(),
            amount,
            unlock_timestamp: user_deposit.unlock_timestamp,
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        require!(!ctx.accounts.hodl_account.paused, ErrorCode::ContractPaused);

        let hodl_account = &mut ctx.accounts.hodl_account;
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
                    hodl_account.authority.as_ref(),
                    &[ctx.bumps.vault],
                ]],
            ),
            amount,
        )?;

        user_deposit.amount = 0;

        hodl_account.total_deposits -= amount;
        hodl_account.last_updated = clock.unix_timestamp;

        emit!(WithdrawEvent {
            user: ctx.accounts.authority.key(),
            amount,
        });

        Ok(())
    }

    pub fn partial_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.hodl_account.paused, ErrorCode::ContractPaused);

        let hodl_account = &mut ctx.accounts.hodl_account;
        let user_deposit = &mut ctx.accounts.user_deposit;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= user_deposit.unlock_timestamp,
            ErrorCode::LockPeriodNotEnded
        );
        require!(user_deposit.amount >= amount, ErrorCode::InsufficientBalance);

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
                    hodl_account.authority.as_ref(),
                    &[ctx.bumps.vault],
                ]],
            ),
            amount,
        )?;

        user_deposit.amount -= amount;

        hodl_account.total_deposits -= amount;
        hodl_account.last_updated = clock.unix_timestamp;

        emit!(WithdrawEvent {
            user: ctx.accounts.authority.key(),
            amount,
        });

        Ok(())
    }

    pub fn pause(ctx: Context<AdminOnly>) -> Result<()> {
        let hodl_account = &mut ctx.accounts.hodl_account;
        hodl_account.paused = true;
        hodl_account.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn unpause(ctx: Context<AdminOnly>) -> Result<()> {
        let hodl_account = &mut ctx.accounts.hodl_account;
        hodl_account.paused = false;
        hodl_account.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 1 + 8)]
    pub hodl_account: Account<'info, HodlAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub hodl_account: Account<'info, HodlAccount>,
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
        seeds = [b"vault", hodl_account.authority.as_ref()],
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
    #[account(mut)]
    pub hodl_account: Account<'info, HodlAccount>,
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
        seeds = [b"vault", hodl_account.authority.as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct AdminOnly<'info> {
    #[account(mut, has_one = authority)]
    pub hodl_account: Account<'info, HodlAccount>,
    pub authority: Signer<'info>,
}

#[account]
pub struct HodlAccount {
    pub authority: Pubkey,
    pub total_deposits: u64,
    pub paused: bool,
    pub last_updated: i64,
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
    #[msg("Contract is paused")]
    ContractPaused,
    #[msg("Insufficient balance for withdrawal")]
    InsufficientBalance,
}