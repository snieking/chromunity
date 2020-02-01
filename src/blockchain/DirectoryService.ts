import { DirectoryServiceBase, ChainConnectionInfo } from "ft3-lib";
import config from "../config.js";

const chainList = [
  new ChainConnectionInfo(
    Buffer.from(config.blockchain.rid, "hex"),
    config.blockchain.nodeApiUrl
  )
];

export default class DirectoryService extends DirectoryServiceBase {
  constructor() {
    super(chainList);
  }
}