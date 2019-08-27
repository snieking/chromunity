import { all } from "redux-saga/effects";
import {accountWatcher} from "./AccountSagas";
import { topicWallWatcher } from "./TopicWallSagas";
import { channelWatcher } from "./ChannelSagas";

export default function* rootSaga() {
  yield all([
    accountWatcher(),
    topicWallWatcher(),
    channelWatcher()
  ]);
}