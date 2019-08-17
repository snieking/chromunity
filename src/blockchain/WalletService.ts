import { Blockchain } from "ft3-lib";
import DirectoryService from "./DirectoryService";
import config from "../config.js";

const chainId = Buffer.from(config.blockchainRID, "hex");

export async function loginWithWallet() {
  const blockchain = await Blockchain.initialize(
    chainId,
    new DirectoryService()
  );
  console.log(`---- Blockchain info ----
name:        ${blockchain.info.name}
website:     ${blockchain.info.website}
description: ${blockchain.info.description}
`);
}
