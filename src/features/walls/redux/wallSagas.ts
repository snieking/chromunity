import { setQueryPending } from './../../../shared/redux/CommonActions';
import {
  LoadAllTopicsByPopularityAction,
  LoadAllTopicWallAction,
  LoadFollowedChannelsTopicsByPopularityAction,
  LoadFollowedChannelsTopicWallAction,
  LoadFollowedUsersTopicsByPopularityAction,
  LoadFollowedUsersTopicWallAction,
  LoadOlderAllTopicsAction,
  LoadOlderFollowedChannelsTopicsAction,
  LoadOlderFollowedUsersTopicsAction,
  WallActionTypes,
  WallType
} from "./wallTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import { Topic } from "../../../types";
import {
  getAllTopicsByPopularityAfterTimestamp,
  getTopicsAfterTimestamp,
  getTopicsByFollowedChannelSortedByPopularityAfterTimestamp,
  getTopicsByFollowsSortedByPopularityAfterTimestamp,
  getTopicsFromFollowedChannelsAfterTimestamp,
  getTopicsFromFollowedChannelsPriorToTimestamp,
  getTopicsFromFollowsAfterTimestamp,
  getTopicsFromFollowsPriorToTimestamp,
  getTopicsPriorToTimestamp
} from "../../../core/services/TopicService";
import { updateTopicWallFromCache, updateTopics } from "./wallActions";
import { ApplicationState } from "../../../core/store";
import { removeDuplicateTopicsFromFirst } from "../../../shared/util/util";

export function* topicWallWatcher() {
  yield takeLatest(WallActionTypes.LOAD_ALL_TOPIC_WALL, loadAllTopics);
  yield takeLatest(WallActionTypes.LOAD_OLDER_ALL_TOPICS, loadOlderAllTopics);
  yield takeLatest(WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY, loadAllTopicsByPopularity);

  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL, loadFollowedChannelsTopics);
  yield takeLatest(WallActionTypes.LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS, loadOlderFollowedChannelsTopics);
  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY, loadFollowedChannelsTopicsByPopularity);

  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL, loadFollowedUsersTopics);
  yield takeLatest(WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS, loadOlderFollowedUsersTopics);
  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY, loadFollowedUsersTopicsByPopularity);
}

export const getAllTopics = (state: ApplicationState) => state.topicWall.all.topics;
export const getAllUpdatedTime = (state: ApplicationState) => state.topicWall.all.updated;
const getAllCouldExistOlder = (state: ApplicationState) => state.topicWall.all.couldExistOlder;

export const getFollowedChannelsTopics = (state: ApplicationState) => state.topicWall.followedChannels.topics;
export const getFollowedChannelsUpdatedTime = (state: ApplicationState) => state.topicWall.followedChannels.updated;
const getFollowedChannelsCouldExistOlder = (state: ApplicationState) =>
  state.topicWall.followedChannels.couldExistOlder;

export const getFollowedUsersTopics = (state: ApplicationState) => state.topicWall.followedUsers.topics;
export const getFollowedUsersUpdatedTime = (state: ApplicationState) => state.topicWall.followedUsers.updated;
const getFollowedUsersCouldExistOlder = (state: ApplicationState) => state.topicWall.followedUsers.couldExistOlder;

const CACHE_DURATION_MILLIS = 1000 * 60;

const cacheExpired = (updated: number): boolean => {
  return Date.now() - updated >= CACHE_DURATION_MILLIS;
};

export function* loadAllTopics(action: LoadAllTopicWallAction) {
  const updated: number = yield select(getAllUpdatedTime);
  let topics: Topic[] = [];
  if (!action.ignoreCache && !cacheExpired(updated)) {
    yield put(updateTopicWallFromCache(WallType.ALL));
    return;
  } else {
    yield put(setQueryPending(true));
    topics = yield select(getAllTopics);
  }

  let retrievedTopics: Topic[];
  let couldExistOlder = false;
  if (topics.length > 0) {
    // Load recent topics
    retrievedTopics = yield getTopicsAfterTimestamp(topics[0].last_modified, action.pageSize);
    couldExistOlder = yield select(getAllCouldExistOlder);
  } else {
    retrievedTopics = yield getTopicsPriorToTimestamp(Date.now(), action.pageSize);
    couldExistOlder = retrievedTopics.length >= action.pageSize;
  }

  yield put(
    updateTopics(
      retrievedTopics.concat(removeDuplicateTopicsFromFirst(topics, retrievedTopics)),
      couldExistOlder,
      WallType.ALL
    )
  );

  yield put(setQueryPending(false));
}

export function* loadOlderAllTopics(action: LoadOlderAllTopicsAction) {
  const topics: Topic[] = yield select(getAllTopics);
  yield put(setQueryPending(true));

  let retrievedTopics: Topic[] = [];
  if (topics.length > 0) {
    retrievedTopics = yield getTopicsPriorToTimestamp(topics[topics.length - 1].last_modified, action.pageSize);
  } else {
    retrievedTopics = yield getTopicsPriorToTimestamp(Date.now(), action.pageSize);
  }

  const updatedTopics: Topic[] = topics.concat(retrievedTopics);

  yield put(updateTopics(updatedTopics, retrievedTopics.length >= action.pageSize, WallType.ALL));
  yield put(setQueryPending(false));
}

export function* loadAllTopicsByPopularity(action: LoadAllTopicsByPopularityAction) {
  yield put(setQueryPending(true));
  const topics: Topic[] = yield getAllTopicsByPopularityAfterTimestamp(action.timestamp, action.pageSize);
  yield put(updateTopics(topics, false, WallType.NONE));
  yield put(setQueryPending(false));
}

export function* loadFollowedUsersTopics(action: LoadFollowedUsersTopicWallAction) {
  const updated: number = yield select(getFollowedUsersUpdatedTime);

  if (!cacheExpired(updated)) {
    yield put(updateTopicWallFromCache(WallType.USER));
    return;
  }

  yield put(setQueryPending(true));
  const topics: Topic[] = yield select(getFollowedUsersTopics);

  let retrievedTopics: Topic[];
  let couldExistOlder = false;
  if (topics.length > 0) {
    retrievedTopics = yield getTopicsFromFollowsAfterTimestamp(
      action.username,
      topics[0].last_modified,
      action.pageSize
    );
    couldExistOlder = yield select(getFollowedUsersCouldExistOlder);
  } else {
    retrievedTopics = yield getTopicsFromFollowsPriorToTimestamp(action.username, Date.now(), action.pageSize);
    couldExistOlder = retrievedTopics.length >= action.pageSize;
  }

  yield put(
    updateTopics(
      retrievedTopics.concat(removeDuplicateTopicsFromFirst(topics, retrievedTopics)),
      couldExistOlder,
      WallType.USER
    )
  );

  yield put(setQueryPending(false));
}

export function* loadOlderFollowedUsersTopics(action: LoadOlderFollowedUsersTopicsAction) {
  const topics: Topic[] = yield select(getFollowedUsersTopics);

  let retrievedTopics: Topic[] = [];
  if (topics.length > 0) {
    yield put(setQueryPending(true));
    retrievedTopics = yield getTopicsFromFollowsPriorToTimestamp(
      action.username,
      topics[topics.length - 1].last_modified,
      action.pageSize
    );
  }

  yield put(updateTopics(topics.concat(retrievedTopics), retrievedTopics.length >= action.pageSize, WallType.USER));
  yield put(setQueryPending(false));
}

export function* loadFollowedUsersTopicsByPopularity(action: LoadFollowedUsersTopicsByPopularityAction) {
  yield put(setQueryPending(true));
  const topics: Topic[] = yield getTopicsByFollowsSortedByPopularityAfterTimestamp(
    action.username,
    action.timestamp,
    action.pageSize
  );
  yield put(updateTopics(topics, false, WallType.NONE));
  yield put(setQueryPending(false));
}

export function* loadFollowedChannelsTopics(action: LoadFollowedChannelsTopicWallAction) {
  const updated: number = yield select(getFollowedChannelsUpdatedTime);

  if (!action.ignoreCache && !cacheExpired(updated)) {
    yield put(updateTopicWallFromCache(WallType.CHANNEL));
    return;
  }

  yield put(setQueryPending(true));
  const topics: Topic[] = yield select(getFollowedChannelsTopics);

  let retrievedTopics: Topic[];
  let couldExistOlder: boolean;
  if (topics.length > 0) {
    // Load recent topics
    retrievedTopics = yield getTopicsFromFollowedChannelsAfterTimestamp(
      action.username,
      topics[0].last_modified,
      action.pageSize
    );
    couldExistOlder = yield select(getFollowedChannelsCouldExistOlder);
  } else {
    retrievedTopics = yield getTopicsFromFollowedChannelsPriorToTimestamp(action.username, Date.now(), action.pageSize);
    couldExistOlder = retrievedTopics.length >= action.pageSize;
  }

  yield put(
    updateTopics(
      retrievedTopics.concat(removeDuplicateTopicsFromFirst(topics, retrievedTopics)),
      couldExistOlder,
      WallType.CHANNEL
    )
  );
  yield put(setQueryPending(false));
}

export function* loadOlderFollowedChannelsTopics(action: LoadOlderFollowedChannelsTopicsAction) {
  const topics: Topic[] = yield select(getFollowedChannelsTopics);

  let retrievedTopics: Topic[] = [];
  if (topics.length > 0) {
    yield put(setQueryPending(true));
    retrievedTopics = yield getTopicsFromFollowedChannelsPriorToTimestamp(
      action.username,
      topics[topics.length - 1].last_modified,
      action.pageSize
    );
  }

  yield put(updateTopics(topics.concat(retrievedTopics), retrievedTopics.length >= action.pageSize, WallType.CHANNEL));
  yield put(setQueryPending(false));
}

export function* loadFollowedChannelsTopicsByPopularity(action: LoadFollowedChannelsTopicsByPopularityAction) {
  yield put(setQueryPending(true));
  const topics: Topic[] = yield getTopicsByFollowedChannelSortedByPopularityAfterTimestamp(
    action.username,
    action.timestamp,
    action.pageSize
  );
  yield put(updateTopics(topics, false, WallType.NONE));
  yield put(setQueryPending(false));
}
