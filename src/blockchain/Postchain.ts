import * as pcl from "postchain-client";
import config from "../config.js";
import DirectoryService from "./DirectoryService";
import { Blockchain, Operation } from "ft3-lib";
import User from "ft3-lib/dist/ft3/user";
import * as BoomerangCache from "boomerang-cache";
import logger from "../util/logger";

const IF_NULL_CLEAR_CACHE = "clear-cache";

const OP_LOCK = BoomerangCache.create("op-lock", {
  storage: "session",
  encrypt: false
});

const QUERY_CACHE_NAME = "query-cache";
const QUERY_CACHE = BoomerangCache.create(QUERY_CACHE_NAME, {
  storage: "session",
  encrypt: false
});

const NODE_API_URL = config.blockchain.nodeApiUrl;
const BLOCKCHAIN_RID = config.blockchain.rid;

export const REST_CLIENT = pcl.restClient.createRestClient(NODE_API_URL, BLOCKCHAIN_RID, 10);
export const GTX = pcl.gtxClient.createClient(REST_CLIENT, Buffer.from(BLOCKCHAIN_RID, "hex"), []);

export const BLOCKCHAIN = Blockchain.initialize(
  Buffer.from(BLOCKCHAIN_RID, "hex"),
  new DirectoryService()
);

export const executeOperations = async (user: User, ...operations: Operation[]) => {
  operations.every(op => logger.debug("Executing operations [%s]: ", op.name, op.args));
  const lockId = JSON.stringify(user);

  const ongoing = OP_LOCK.get(lockId) != null;

  if (ongoing) {
    console.log("An operation is already in progress for user");
    return new Promise<unknown>(resolve => resolve());
  } else {
    if (!test) {
      OP_LOCK.set(lockId, operations, 2);
    }
  }

  const BC = await BLOCKCHAIN;
  const trxBuilder = BC.transactionBuilder();
  operations.every(value => trxBuilder.add(value));
  return trxBuilder.buildAndSign(user).post()
    .then(result => {
      OP_LOCK.remove(lockId);
      return result;
    });
};

export const executeQuery = async (name: string, params: unknown) => {
  logger.debug("Executing query: [%s] with data: ", name, params);
  if (QUERY_CACHE.get(IF_NULL_CLEAR_CACHE) == null && !test) {
    removeSessionObjects();
    QUERY_CACHE.set(IF_NULL_CLEAR_CACHE, false, 10);
  }

  const cacheId = name + ":" + JSON.stringify(params);

  const cachedResult = QUERY_CACHE.get(cacheId);
  if (cachedResult != null) {
    logger.debug("Returning cached result: ", cachedResult);
    return new Promise<any>(resolve => resolve(cachedResult));
  }

  const BC = await BLOCKCHAIN;
  return BC.query(name, params)
    .then(result => {
      if (!test) {
        QUERY_CACHE.set(cacheId, result, 3);
      }

      logger.debug("Returning result: ", result);
      return result;
    })
};

const removeSessionObjects = () => {
  const items = sessionStorage.length;

  const keys = Object.keys(sessionStorage);
  for (let i = 0; i < items; i++) {
    const keySplit = keys[i].split(":");

    if (QUERY_CACHE_NAME === keySplit[0]) {
      sessionStorage.removeItem(keys[i]);
    }
  }
};

const test: boolean = process.env.JEST_WORKER_ID !== undefined;