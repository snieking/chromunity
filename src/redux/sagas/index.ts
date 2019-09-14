import { all } from "redux-saga/effects";
import {accountWatcher} from "./AccountSagas";
import { topicWallWatcher } from "./TopicWallSagas";
import { channelWatcher } from "./ChannelSagas";
import { userPageWatcher } from "./UserPageSagas";
import { representativesWatcher } from "./RepresentativesSagas";

export default function* rootSaga() {
  yield all([
    accountWatcher(),
    topicWallWatcher(),
    channelWatcher(),
    userPageWatcher(),
    representativesWatcher()
  ]);
}