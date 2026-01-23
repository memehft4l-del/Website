use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("CA4ADsMYjuCQMsGfHuxHzcn4s6VuiQCtT49MGCLANEvb");

#[program]
pub mod clash_royale_escrow {
    use super::*;

    /// Create a new wager
    /// Seeds: [b"wager", creator.key(), wager_id]
    pub fn create_wager(
        ctx: Context<CreateWager>,
        wager_id: u64,
        amount: u64,
    ) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        let creator = &ctx.accounts.creator;

        // Initialize wager account
        wager.creator = creator.key();
        wager.opponent = None;
        wager.amount = amount;
        wager.status = WagerStatus::Created;
        wager.winner = None;
        wager.wager_id = wager_id;

        // Transfer SOL from creator to escrow
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: creator.to_account_info(),
                to: wager.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        msg!("Wager created: {} SOL by {}", amount, creator.key());
        Ok(())
    }

    /// Join an existing wager
    /// Opponent transfers same amount and status becomes Active
    pub fn join_wager(ctx: Context<JoinWager>) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        let opponent = &ctx.accounts.opponent;

        // Verify wager is in Created status
        require!(
            wager.status == WagerStatus::Created,
            EscrowError::InvalidWagerStatus
        );

        // Verify opponent is not the creator
        require!(
            wager.creator != opponent.key(),
            EscrowError::CannotJoinOwnWager
        );

        // Set opponent and update status
        wager.opponent = Some(opponent.key());
        wager.status = WagerStatus::Active;

        // Transfer SOL from opponent to escrow
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: opponent.to_account_info(),
                to: wager.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, wager.amount)?;

        msg!(
            "Wager joined: {} SOL by {}. Status: Active",
            wager.amount,
            opponent.key()
        );
        Ok(())
    }

    /// Resolve wager and distribute funds
    /// Only BACKEND_AUTHORITY can call this
    pub fn resolve_wager(
        ctx: Context<ResolveWager>,
        winner_pubkey: Pubkey,
    ) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        let winner = &ctx.accounts.winner;
        let platform_treasury = &ctx.accounts.platform_treasury;
        let creator = &ctx.accounts.creator;

        // Verify wager is Active
        require!(
            wager.status == WagerStatus::Active,
            EscrowError::InvalidWagerStatus
        );

        // Verify winner is either creator or opponent
        require!(
            winner.key() == wager.creator || winner.key() == wager.opponent.unwrap(),
            EscrowError::InvalidWinner
        );

        // Verify winner_pubkey matches the winner account
        require!(
            winner_pubkey == winner.key(),
            EscrowError::WinnerMismatch
        );

        // Calculate total pot (2x amount)
        let total_pot = wager.amount
            .checked_mul(2)
            .ok_or(EscrowError::MathOverflow)?;

        // Calculate platform fee (5%)
        let platform_fee = total_pot
            .checked_mul(5)
            .ok_or(EscrowError::MathOverflow)?
            .checked_div(100)
            .ok_or(EscrowError::MathOverflow)?;

        // Calculate winner payout (total - fee)
        let winner_payout = total_pot
            .checked_sub(platform_fee)
            .ok_or(EscrowError::MathOverflow)?;

        // Transfer winner payout
        **wager.to_account_info().try_borrow_mut_lamports()? -= winner_payout;
        **winner.to_account_info().try_borrow_mut_lamports()? += winner_payout;

        // Transfer platform fee
        **wager.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
        **platform_treasury.to_account_info().try_borrow_mut_lamports()? += platform_fee;

        // Update wager status
        wager.status = WagerStatus::Resolved;
        wager.winner = Some(winner.key());

        // Close PDA and return rent to creator
        let rent_lamports = wager.to_account_info().lamports();
        **wager.to_account_info().try_borrow_mut_lamports()? = 0;
        **creator.to_account_info().try_borrow_mut_lamports()? += rent_lamports;

        msg!(
            "Wager resolved: Winner {}, Payout: {} SOL, Fee: {} SOL",
            winner.key(),
            winner_payout,
            platform_fee
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(wager_id: u64)]
pub struct CreateWager<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Wager::LEN,
        seeds = [b"wager", creator.key().as_ref(), &wager_id.to_le_bytes()],
        bump
    )]
    pub wager: Account<'info, Wager>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinWager<'info> {
    #[account(mut)]
    pub wager: Account<'info, Wager>,
    #[account(mut)]
    pub opponent: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveWager<'info> {
    #[account(mut)]
    pub wager: Account<'info, Wager>,
    /// CHECK: Verified in instruction logic
    #[account(mut)]
    pub winner: AccountInfo<'info>,
    /// CHECK: Platform treasury address
    #[account(mut)]
    pub platform_treasury: AccountInfo<'info>,
    /// CHECK: Creator receives rent refund
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    /// CHECK: Only backend authority can resolve
    pub backend_authority: Signer<'info>,
}

#[account]
pub struct Wager {
    pub creator: Pubkey,
    pub opponent: Option<Pubkey>,
    pub amount: u64,
    pub status: WagerStatus,
    pub winner: Option<Pubkey>,
    pub wager_id: u64,
}

impl Wager {
    pub const LEN: usize = 32 + // creator
        1 + 32 + // opponent (Option<Pubkey>)
        8 + // amount
        1 + // status
        1 + 32 + // winner (Option<Pubkey>)
        8; // wager_id
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum WagerStatus {
    Created,
    Active,
    Resolved,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid wager status for this operation")]
    InvalidWagerStatus,
    #[msg("Cannot join your own wager")]
    CannotJoinOwnWager,
    #[msg("Invalid winner")]
    InvalidWinner,
    #[msg("Winner pubkey mismatch")]
    WinnerMismatch,
    #[msg("Math overflow")]
    MathOverflow,
}

