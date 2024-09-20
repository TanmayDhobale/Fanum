import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HodlProject } from "../target/types/hodl_project";

describe("hodl_project", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.HodlProject as Program<HodlProject>;

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
