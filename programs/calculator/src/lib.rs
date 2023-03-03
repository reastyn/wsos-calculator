use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("9p2iYDc4bBqmp3vWWU38d7rFeTtYSTdBfDGG9gRgU6H7");

#[error_code]
pub enum ErrorCode {
    #[msg("Overflow or underflow error")]
    OverflowUnderflow,

    #[msg("Division by zero")]
    DivisionByZero,
}

#[program]
pub mod calculator {
    use super::*;

    pub fn create(ctx: Context<Create>, init_message: String) -> ProgramResult {
        let calculator = &mut ctx.accounts.calculator;
        calculator.greeting = init_message;
        Ok({})
    }

    pub fn add(ctx: Context<Addition>, num1: i64, num2: i64) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        let res = num1.checked_add(num2);
        if res.is_none() {
            return Err(ErrorCode::OverflowUnderflow.into());
        }
        calculator.result = res.unwrap();
        Ok(())
    }

    pub fn multiply(ctx: Context<Addition>, num1: i64, num2: i64) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        let res = num1.checked_mul(num2);
        if res.is_none() {
            return Err(ErrorCode::OverflowUnderflow.into());
        }
        calculator.result = res.unwrap();
        Ok(())
    }

    pub fn divide(ctx: Context<Addition>, num1: i64, num2: i64) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        if num2 == 0 {
            return Err(ErrorCode::DivisionByZero.into());
        }
        let res = num1.checked_div(num2);
        if res.is_none() {
            return Err(ErrorCode::OverflowUnderflow.into());
        }
        calculator.result = res.unwrap();
        Ok(())
    }

    pub fn substract(ctx: Context<Addition>, num1: i64, num2: i64) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        let res = num1.checked_sub(num2);
        if res.is_none() {
            return Err(ErrorCode::OverflowUnderflow.into());
        }
        calculator.result = res.unwrap();
        Ok(())
    }

    pub fn pow(ctx: Context<Addition>, num: i64, exp: u32) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;
        let res = num.checked_pow(exp);
        if res.is_none() {
            return Err(ErrorCode::OverflowUnderflow.into());
        }
        calculator.result = res.unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=264)]
    pub calculator: Account<'info, Calculator>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Addition<'info> {
    #[account(mut)]
    pub calculator: Account<'info, Calculator>,
}

#[account]
pub struct Calculator {
    greeting: String,
    result: i64,
}
