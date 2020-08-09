// This script can be used to call the update_block operation which is used to update rate limiting.
const pcl = require('postchain-client');

// const nodeApiUrl = 'http://localhost:7740';
// const blockchainRID = '3E691799CE1AD9C022B72E62C2B544C519A7B9D092C76E9A731D99C20125F024';
const nodeApiUrl = 'https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/';
const blockchainRID = '58771843CE58B890CF6FDE8C57F3F564DF741F0C05C5444D24D3A48BB3674497';
// const nodeApiUrl = 'https://3o5bblkaha.execute-api.eu-west-1.amazonaws.com/chromia-node-vault/';
// const blockchainRID = '8683A6FB0F8B1A8A9C335ECB69743500590CA881FE567A75C627BA4CFFE7E254';

const rest = pcl.restClient.createRestClient(nodeApiUrl, blockchainRID, 5);
const gtx = pcl.gtxClient.createClient(rest, Buffer.from(blockchainRID, 'hex'), []);

(async () => {
  const privKey = Buffer('a30d99841004de1133d8b40ff01a50bbaa6ed944e0794d5bf52052696e214fbc', 'hex');
  const pubKey = new pcl.util.createPublicKey(privKey);

  const tx = gtx.newTransaction([pubKey]);
  tx.addOperation('update_at_block_300000');
  tx.addOperation('nop');

  tx.sign(privKey, pubKey);
  await tx.postAndWaitConfirmation(privKey, pubKey);
})();
