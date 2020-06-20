import * as pcl from 'postchain-client';
import { Operation, User } from 'ft3-lib';
import * as BoomerangCache from 'boomerang-cache';
import Postchain from 'ft3-lib/dist/ft3/core/postchain';
import { Stopwatch } from 'ts-stopwatch';
import logger from '../../shared/util/logger';
import config from '../../config';
import { metricEvent } from '../../shared/util/matomo';

const IF_NULL_CLEAR_CACHE = 'clear-cache';

const OP_LOCK = BoomerangCache.create('op-lock', {
  storage: 'session',
  encrypt: false,
});

const QUERY_CACHE_NAME = 'query-cache';
const QUERY_CACHE = BoomerangCache.create(QUERY_CACHE_NAME, {
  storage: 'session',
  encrypt: false,
});

const NODE_API_URL = config.blockchain.nodeApiUrl;
const BLOCKCHAIN_RID = config.blockchain.rid;

export const REST_CLIENT = pcl.restClient.createRestClient(NODE_API_URL, BLOCKCHAIN_RID, 10);
export const GTX = pcl.gtxClient.createClient(REST_CLIENT, Buffer.from(BLOCKCHAIN_RID, 'hex'), []);

export const BLOCKCHAIN = new Postchain(NODE_API_URL).blockchain(BLOCKCHAIN_RID);

export const executeOperations = async (user: User, ...operations: Operation[]) => {
  if (operations.length < 1) return new Promise<unknown>((resolve) => resolve());

  operations.every((op) => logger.debug('Executing operation [%s] for user [%o]', op.name, JSON.stringify(user)));
  const lockId = JSON.stringify(operations[0].name);

  const ongoing = OP_LOCK.get(lockId) != null;

  if (ongoing) {
    logger.info('An operation is already in progress for user');
    return new Promise<unknown>((resolve) => resolve());
  }
  if (!test) {
    OP_LOCK.set(lockId, operations, 60);
  }

  const BC = await BLOCKCHAIN;
  const trxBuilder = BC.transactionBuilder();
  operations.every((value) => trxBuilder.add(value));

  const stopwatch = new Stopwatch();
  stopwatch.start();

  return trxBuilder
    .buildAndSign(user)
    .post()
    .finally(() => {
      OP_LOCK.remove(lockId);
      finalizeMetrics('transactions', operations[0].name, stopwatch);
    });
};

export const executeQuery = async (name: string, params: any) => {
  logger.debug(`Executing query: ${name} with data: ${JSON.stringify(params)}`);
  if (QUERY_CACHE.get(IF_NULL_CLEAR_CACHE) == null && !test) {
    removeSessionObjects();
    QUERY_CACHE.set(IF_NULL_CLEAR_CACHE, false, 10);
  }

  const cacheId = `${name}:${JSON.stringify(params)}`;

  const cachedResult = QUERY_CACHE.get(cacheId);
  if (cachedResult != null) {
    logger.debug(`Returning cached result: ${JSON.stringify(cachedResult)}`);
    return new Promise<any>((resolve) => resolve(cachedResult));
  }

  const BC = await BLOCKCHAIN;

  return BC.query(name, params).then((result: unknown) => {
    if (!test) {
      QUERY_CACHE.set(cacheId, result, 3);
    }

    logger.debug(`Returning result: ${JSON.stringify(result)}`);
    return result;
  });
};

const finalizeMetrics = (type: string, name: string, sw: Stopwatch) => {
  sw.stop();
  metricEvent(type, name, sw.getTime());
};

const removeSessionObjects = () => {
  if (sessionStorage) {
    const items = sessionStorage.length;

    const keys = Object.keys(sessionStorage);
    for (let i = 0; i < items; i++) {
      const keySplit = keys[i].split(':');

      if (QUERY_CACHE_NAME === keySplit[0]) {
        sessionStorage.removeItem(keys[i]);
      }
    }
  }
};

const test: boolean = process.env.JEST_WORKER_ID !== undefined;
