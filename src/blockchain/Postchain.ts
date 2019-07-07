import * as pcl from "postchain-client";
import * as config from "../config.js";

const NODE_API_URL = config.nodeApiUrl;
const BLOCKCHAIN_RID = config.blockchainRID;

export const REST_CLIENT = pcl.restClient.createRestClient(NODE_API_URL, BLOCKCHAIN_RID, 5);
export const GTX = pcl.gtxClient.createClient(REST_CLIENT, Buffer.from(BLOCKCHAIN_RID, "hex"), []);
