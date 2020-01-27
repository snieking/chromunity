import * as pcl from "postchain-client";
import config from "../config.js";
import DirectoryService from "./DirectoryService";
import { Blockchain, op, Operation } from "ft3-lib";
import User from "ft3-lib/dist/ft3/user";

const NODE_API_URL = config.nodeApiUrl;
const BLOCKCHAIN_RID = config.blockchainRID;

export const REST_CLIENT = pcl.restClient.createRestClient(NODE_API_URL, BLOCKCHAIN_RID, 10);
export const GTX = pcl.gtxClient.createClient(REST_CLIENT, Buffer.from(BLOCKCHAIN_RID, "hex"), []);

export const BLOCKCHAIN = Blockchain.initialize(
  Buffer.from(BLOCKCHAIN_RID, "hex"),
  new DirectoryService()
);

export const executeOperations = async (user: User, ...operations: Operation[]) => {
  const BC = await BLOCKCHAIN;
  const trxBuilder = BC.transactionBuilder();
  operations.every(value => trxBuilder.add(value));
  return trxBuilder.buildAndSign(user).post();
};