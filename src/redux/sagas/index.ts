import { all } from "redux-saga/effects";
import {accountWatcher} from "./AccountSagas";
import { topicWallWatcher } from "./TopicWallSagas";

export default function* rootSaga() {
  yield all([
    accountWatcher(),
    topicWallWatcher()
  ]);
}