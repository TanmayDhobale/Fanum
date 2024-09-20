import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HodlProject } from "../target/types/hodl_project";

describe("hodl_project", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HodlProject as Program<HodlProject>;

  it("Is initialized!", async () => {
    const hodlAccount = anchor.web3.Keypair.generate();
    const tx = await program.methods.initialize()
      .accounts({
        hodlAccount: hodlAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([hodlAccount])
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
