import {
  LoadUserFollowedChannelsAction,
  LoadUserRepliesAction,
  LoadUserTopicsAction,
  UserPageActionTypes
} from "./userTypes";
import { select, takeLatest, put } from "redux-saga/effects";
import { ApplicationState } from "../../../core/store";
import { Topic, TopicReply } from "../../../types";
import { getTopicRepliesByUserPriorToTimestamp, getTopicsByUserPriorToTimestamp } from "../../../core/services/TopicService";
import { updateUserFollowedChannels, updateUserReplies, updateUserTopics } from "./userPageActions";
import { getFollowedChannels } from "../../../core/services/ChannelService";

export function* userPageWatcher() {
  yield takeLatest(UserPageActionTypes.LOAD_USER_TOPICS, loadUserTopics);
  yield takeLatest(UserPageActionTypes.LOAD_USER_REPLIES, loadUserReplies);
  yield takeLatest(UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS, loadUserFollowedChannels);
}

const getTopics = (state: ApplicationState) => state.userPage.topics;
const getReplies = (state: ApplicationState) => state.userPage.replies;

export function* loadUserTopics(action: LoadUserTopicsAction) {
  const username: string = action.username;
  const topics: Topic[] = yield select(getTopics);

  const timestamp: number = topics.length > 0 ? topics[topics.length - 1].last_modified : Date.now();
  const retrievedTopics: Topic[] = yield getTopicsByUserPriorToTimestamp(username, timestamp, action.pageSize);
  yield put(updateUserTopics(topics.concat(retrievedTopics), retrievedTopics.length >= action.pageSize));
}

export function* loadUserReplies(action: LoadUserRepliesAction) {
  const username: string = action.username;
  const replies: TopicReply[] = yield select(getReplies);

  const timestamp: number = replies.length > 0 ? replies[replies.length - 1].timestamp : Date.now();
  const retrievedReplies: TopicReply[] = yield getTopicRepliesByUserPriorToTimestamp(
    username,
    timestamp,
    action.pageSize
  );

  yield put(updateUserReplies(replies.concat(retrievedReplies), retrievedReplies.length >= action.pageSize));
}

export function* loadUserFollowedChannels(action: LoadUserFollowedChannelsAction) {
  const username: string = action.username;
  const channels: string[] = yield getFollowedChannels(username);
  yield put(updateUserFollowedChannels(channels));
}
