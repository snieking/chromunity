import { select, takeLatest, put } from 'redux-saga/effects';
import { Action } from 'redux';
import { setQueryPending } from '../../../shared/redux/common-actions';
import { UserPageActionTypes } from './user-types';
import ApplicationState from '../../../core/application-state';
import { Topic, TopicReply } from '../../../types';
import {
  getTopicRepliesByUserPriorToTimestamp,
  getTopicsByUserPriorToTimestamp,
} from '../../../core/services/topic-service';
import {
  updateUserFollowedChannels,
  updateUserReplies,
  updateUserTopics,
  loadUserTopics,
  loadUserReplies,
  loadUserFollowedChannels,
} from './user-page-actions';
import { getFollowedChannels } from '../../../core/services/channel-service';

export function* userPageWatcher() {
  yield takeLatest(UserPageActionTypes.LOAD_USER_TOPICS, loadUserTopicsSaga);
  yield takeLatest(UserPageActionTypes.LOAD_USER_REPLIES, loadUserRepliesSaga);
  yield takeLatest(UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS, loadUserFollowedChannelsSaga);
}

const getTopics = (state: ApplicationState) => state.userPage.topics;
const getReplies = (state: ApplicationState) => state.userPage.replies;

export function* loadUserTopicsSaga(action: Action) {
  if (loadUserTopics.match(action)) {
    yield put(setQueryPending(true));
    const { username } = action.payload;
    const { pageSize } = action.payload;
    const topics: Topic[] = yield select(getTopics);

    const timestamp: number = topics.length > 0 ? topics[topics.length - 1].last_modified : Date.now();
    const retrievedTopics: Topic[] = yield getTopicsByUserPriorToTimestamp(username, timestamp, pageSize);
    yield put(
      updateUserTopics({
        topics: topics.concat(retrievedTopics),
        couldExistOlderTopics: retrievedTopics.length >= pageSize,
      })
    );
    yield put(setQueryPending(false));
  }
}

export function* loadUserRepliesSaga(action: Action) {
  if (loadUserReplies.match(action)) {
    yield put(setQueryPending(true));
    const { username } = action.payload;
    const { pageSize } = action.payload;
    const replies: TopicReply[] = yield select(getReplies);

    const timestamp: number = replies.length > 0 ? replies[replies.length - 1].timestamp : Date.now();
    const retrievedReplies: TopicReply[] = yield getTopicRepliesByUserPriorToTimestamp(username, timestamp, pageSize);

    yield put(
      updateUserReplies({
        replies: replies.concat(retrievedReplies),
        couldExistOlderReplies: retrievedReplies.length >= pageSize,
      })
    );
    yield put(setQueryPending(false));
  }
}

export function* loadUserFollowedChannelsSaga(action: Action) {
  if (loadUserFollowedChannels.match(action)) {
    yield put(setQueryPending(true));
    const username: string = action.payload;
    const channels: string[] = yield getFollowedChannels(username);
    yield put(updateUserFollowedChannels(channels));
    yield put(setQueryPending(false));
  }
}
