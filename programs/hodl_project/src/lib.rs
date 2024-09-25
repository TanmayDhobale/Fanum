use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Cs3zUdBmUuo8jFzmtQUAtTHtK7ZKpnK75mfTFDYbLsWt");
#[program]
pub mod hodl_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.admin = ctx.accounts.admin.key();
        state.paused = false;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let state = &ctx.accounts.state;
        require!(!state.paused, ErrorCode::ProgramPaused);

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

        let lock_period = 10 * 365 * 24 * 60 * 60; 

        user_deposit.owner = ctx.accounts.authority.key();
        user_deposit.amount += amount;
        user_deposit.deposit_timestamp = clock.unix_timestamp;
        user_deposit.unlock_timestamp = clock.unix_timestamp + lock_period;
        user_deposit.reward_rate = calculate_reward_rate(lock_period);

        emit!(DepositEvent {
            user: ctx.accounts.authority.key(),
            amount,
            unlock_timestamp: user_deposit.unlock_timestamp,
            reward_rate: user_deposit.reward_rate,
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let state = &ctx.accounts.state;
        require!(!state.paused, ErrorCode::ProgramPaused);

        let user_deposit = &mut ctx.accounts.user_deposit;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= user_deposit.unlock_timestamp,
            ErrorCode::LockPeriodNotEnded
        );

        let amount = user_deposit.amount;
        let rewards = calculate_rewards(user_deposit, clock.unix_timestamp);
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
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.reward_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.reward_vault.to_account_info(),
                },
                &[&[b"reward_vault", &[ctx.bumps.reward_vault]]],
            ),
            rewards,
        )?;
        user_deposit.amount = 0;

        emit!(WithdrawEvent {
            user: ctx.accounts.authority.key(),
            amount,
            rewards,
        });

        Ok(())
    }

    pub fn fund_reward_vault(ctx: Context<FundRewardVault>, amount: u64) -> Result<()> {
        let state = &ctx.accounts.state;
        require!(!state.paused, ErrorCode::ProgramPaused);
        require!(ctx.accounts.funder.key() == state.admin, ErrorCode::Unauthorized);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.funder_token_account.to_account_info(),
                    to: ctx.accounts.reward_vault.to_account_info(),
                    authority: ctx.accounts.funder.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(FundRewardVaultEvent {
            funder: ctx.accounts.funder.key(),
            amount,
        });

        Ok(())
    }

    pub fn pause(ctx: Context<AdminAction>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.paused = true;
        emit!(PausedEvent {});
        Ok(())
    }

    pub fn unpause(ctx: Context<AdminAction>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.paused = false;
        emit!(UnpausedEvent {});
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = admin, 
        space = 8 + 32 + 1 + 32 
    )]
    pub state: Account<'info, ProgramState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub state: Account<'info, ProgramState>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 32,
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
    #[account(mut)]
    pub state: Account<'info, ProgramState>,
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
    #[account(
        mut,
        seeds = [b"reward_vault"],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct FundRewardVault<'info> {
    #[account(mut)]
    pub state: Account<'info, ProgramState>,
    #[account(mut)]
    pub funder_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"reward_vault"],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub funder: Signer<'info>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(mut, has_one = admin @ ErrorCode::Unauthorized)]
    pub state: Account<'info, ProgramState>,
    pub admin: Signer<'info>,
}

#[account]
pub struct ProgramState {
    pub admin: Pubkey,
    pub paused: bool,
}

#[account]
pub struct UserDeposit {
    pub owner: Pubkey,
    pub amount: u64,
    pub deposit_timestamp: i64,
    pub unlock_timestamp: i64,
    pub reward_rate: u64,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub unlock_timestamp: i64,
    pub reward_rate: u64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub rewards: u64,
}

#[event]
pub struct FundRewardVaultEvent {
    pub funder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct PausedEvent {}

#[event]
pub struct UnpausedEvent {}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid deposit amount")]
    InvalidAmount,
    #[msg("Lock period has not ended yet")]
    LockPeriodNotEnded,
    #[msg("Unauthorized withdrawal attempt")]
    UnauthorizedWithdrawal,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Unauthorized")]
    Unauthorized,
}

fn calculate_reward_rate(lock_period: i64) -> u64 {
    // Example: 5% base APY, additional 1% for each year locked 
    let base_rate = 5;
    let additional_rate = (lock_period / (365 * 24 * 60 * 60)) as u64;
    base_rate + additional_rate
}

fn calculate_rewards(user_deposit: &UserDeposit, current_timestamp: i64) -> u64 {
    let lock_duration = (current_timestamp - user_deposit.deposit_timestamp) as u64;
    let years_locked = lock_duration / (365 * 24 * 60 * 60);
    (user_deposit.amount * user_deposit.reward_rate * years_locked) / 100
}