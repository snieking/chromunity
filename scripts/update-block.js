// This script can be used to call the update_block operation which is used to update rate limiting.
const pcl = require("postchain-client");

const nodeApiUrl = "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/";
const blockchainRID = "58771843CE58B890CF6FDE8C57F3F564DF741F0C05C5444D24D3A48BB3674497";

const rest = pcl.restClient.createRestClient(nodeApiUrl, blockchainRID, 5);
const gtx = pcl.gtxClient.createClient(rest, Buffer.from(blockchainRID, "hex"), []);

(async () => {
  const privKey = Buffer("a30d99841004de1133d8b40ff01a50bbaa6ed944e0794d5bf52052696e214fbc", "hex");
  const pubKey = new pcl.util.createPublicKey(privKey);

  const tx = gtx.newTransaction([pubKey]);
  tx.addOperation("update_block_79000");
  tx.addOperation("nop");

  tx.sign(privKey, pubKey);
  await tx.postAndWaitConfirmation(privKey, pubKey);
})();
