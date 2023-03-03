import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Calculator } from "../target/types/calculator";
const { SystemProgram } = anchor.web3;
import { expect } from "chai";

const MAX_i64_VALUE = new anchor.BN("9223372036854775807");
const MIN_i64_VALUE = new anchor.BN("-9223372036854775808");

export const expectToThrow = async (
  fn: () => Promise<any>,
  errorCode: string
) => {
  try {
    await fn();
  } catch (e) {
    expect(e.error.errorCode.code).to.equal(errorCode);
    return;
  }
  expect.fail("function should have thrown");
};

//Moka works using predescribed it blocks
describe("calculator", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  //Referencing the program - Abstraction that allows us to call methods of our SOL program.
  const program = anchor.workspace.Calculator as Program<Calculator>;
  const programProvider = program.provider as anchor.AnchorProvider;

  //Generating a keypair for our Calculator account
  const calculatorPair = anchor.web3.Keypair.generate();

  const text = "Summer School Of Solana";

  //Creating a test block
  it("Creating Calculator Instance", async () => {
    //Calling create instance - Set our calculator keypair as a signer
    await program.methods
      .create(text)
      .accounts({
        calculator: calculatorPair.publicKey,
        user: programProvider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([calculatorPair])
      .rpc();

    //We fecth the account and read if the string is actually in the account
    const account = await program.account.calculator.fetch(
      calculatorPair.publicKey
    );
    expect(account.greeting).to.eql(text);
  });

  //Another test step - test out addition
  it("Addition", async () => {
    await program.methods
      .add(new anchor.BN(2), new anchor.BN(3))
      .accounts({
        calculator: calculatorPair.publicKey,
      })
      .rpc();
    const account = await program.account.calculator.fetch(
      calculatorPair.publicKey
    );
    expect(account.result).to.eql(new anchor.BN(5));
    await expectToThrow(
      async () =>
        program.methods
          .add(MAX_i64_VALUE, new anchor.BN(2))
          .accounts({ calculator: calculatorPair.publicKey })
          .rpc(),
      "OverflowUnderflow"
    );
  });

  it("Substraction", async () => {
    await program.methods
      .substract(new anchor.BN(2), new anchor.BN(3))
      .accounts({
        calculator: calculatorPair.publicKey,
      })
      .rpc();
    const account = await program.account.calculator.fetch(
      calculatorPair.publicKey
    );
    expect(account.result).to.eql(new anchor.BN(-1));
    await expectToThrow(
      async () =>
        program.methods
          .substract(MIN_i64_VALUE, new anchor.BN(123))
          .accounts({ calculator: calculatorPair.publicKey })
          .rpc(),
      "OverflowUnderflow"
    );
  });

  it("Multiplication", async () => {
    await program.methods
      .multiply(new anchor.BN(69), new anchor.BN(420))
      .accounts({
        calculator: calculatorPair.publicKey,
      })
      .rpc();
    const account = await program.account.calculator.fetch(
      calculatorPair.publicKey
    );
    expect(account.result).to.eql(new anchor.BN(28980));
    await expectToThrow(
      async () =>
        program.methods
          .multiply(MAX_i64_VALUE, new anchor.BN(2))
          .accounts({ calculator: calculatorPair.publicKey })
          .rpc(),
      "OverflowUnderflow"
    );
  });

  it("Division", async () => {
    await program.methods
      .divide(new anchor.BN(69), new anchor.BN(2))
      .accounts({
        calculator: calculatorPair.publicKey,
      })
      .rpc();
    const account = await program.account.calculator.fetch(
      calculatorPair.publicKey
    );
    expect(account.result).to.eql(new anchor.BN(34.5));
    await expectToThrow(
      async () =>
        program.methods
          .divide(new anchor.BN(1), new anchor.BN(0))
          .accounts({ calculator: calculatorPair.publicKey })
          .rpc(),
      "DivisionByZero"
    );
  });

  it("Power", async () => {
    await program.methods
      .pow(new anchor.BN(5), 2)
      .accounts({
        calculator: calculatorPair.publicKey,
      })
      .rpc();
    const account = await program.account.calculator.fetch(
      calculatorPair.publicKey
    );
    expect(account.result).to.eql(new anchor.BN(25));
    await expectToThrow(
      async () =>
        program.methods
          .pow(MAX_i64_VALUE, 2)
          .accounts({ calculator: calculatorPair.publicKey })
          .rpc(),
      "OverflowUnderflow"
    );
  });
});
