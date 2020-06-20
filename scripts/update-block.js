// This script can be used to call the update_block operation which is used to update rate limiting.
const pcl = require('postchain-client');

const nodeApiUrl = 'https://3o5bblkaha.execute-api.eu-west-1.amazonaws.com/chromia-node-vault/';
const blockchainRID = '8683A6FB0F8B1A8A9C335ECB69743500590CA881FE567A75C627BA4CFFE7E254';

const rest = pcl.restClient.createRestClient(nodeApiUrl, blockchainRID, 5);
const gtx = pcl.gtxClient.createClient(rest, Buffer.from(blockchainRID, 'hex'), []);

(async () => {
  const privKey = Buffer('a30d99841004de1133d8b40ff01a50bbaa6ed944e0794d5bf52052696e214fbc', 'hex');
  const pubKey = new pcl.util.createPublicKey(privKey);

  const tx = gtx.newTransaction([pubKey]);
  tx.addOperation('update_block_79000');
  tx.addOperation('nop');

  tx.sign(privKey, pubKey);
  await tx.postAndWaitConfirmation(privKey, pubKey);
})();
