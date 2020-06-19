import { all } from "redux-saga/effects";
import { accountWatcher } from "../features/user/redux/AccountSagas";
import { topicWallWatcher } from "../features/walls/redux/wallSagas";
import { channelWatcher } from "../features/walls/redux/channelSagas";
import { userPageWatcher } from "../features/user/redux/userPageSagas";
import { governmentWatcher } from "../features/governing/redux/govSagas";
import { chatWatcher } from "../features/chat/redux/chatSagas";
import { commonWatcher } from "../shared/redux/CommonSagas";

export default function* saga() {
  yield all([
    accountWatcher(),
    topicWallWatcher(),
    channelWatcher(),
    userPageWatcher(),
    governmentWatcher(),
    chatWatcher(),
    commonWatcher()
  ]);
}
