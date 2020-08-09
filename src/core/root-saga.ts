import { all } from 'redux-saga/effects';
import { accountWatcher } from '../features/user/redux/account-sagas';
import { topicWallWatcher } from '../features/walls/redux/wall-sagas';
import { channelWatcher } from '../features/walls/redux/channel-sagas';
import { userPageWatcher } from '../features/user/redux/user-page-sagas';
import { governmentWatcher } from '../features/governing/redux/gov-sagas';
import { chatWatcher } from '../features/chat/redux/chat-sagas';
import { commonWatcher } from '../shared/redux/common-sagas';
import { storeWatcher } from '../features/store/redux/store-sagas';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function* saga() {
  yield all([
    accountWatcher(),
    topicWallWatcher(),
    channelWatcher(),
    userPageWatcher(),
    governmentWatcher(),
    chatWatcher(),
    commonWatcher(),
    storeWatcher(),
  ]);
}
