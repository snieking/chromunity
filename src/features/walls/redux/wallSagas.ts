import { setQueryPending } from './../../../shared/redux/CommonActions';
import {
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
import { updateTopicWallFromCache, updateTopics, loadAllTopicWall, loadOlderAllTopics, loadAllTopicsByPopularity, loadFollowedUsersTopicWall, loadOlderFollowedUsersTopics, loadFollowedUsersTopicsByPopularity, loadFollowedChannelsTopicWall, loadOlderFollowedChannelsTopics, loadFollowedChannelsTopicsByPopularity } from "./wallActions";
import ApplicationState from "../../../core/application-state";
import { removeDuplicateTopicsFromFirst } from "../../../shared/util/util";
import { Action } from 'redux';

export function* topicWallWatcher() {
  yield takeLatest(WallActionTypes.LOAD_ALL_TOPIC_WALL, loadAllTopicsSaga);
  yield takeLatest(WallActionTypes.LOAD_OLDER_ALL_TOPICS, loadOlderAllTopicsSaga);
  yield takeLatest(WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY, loadAllTopicsByPopularitySaga);

  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL, loadFollowedChannelsTopicsSaga);
  yield takeLatest(WallActionTypes.LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS, loadOlderFollowedChannelsTopicsSaga);
  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY, loadFollowedChannelsTopicsByPopularitySaga);

  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL, loadFollowedUsersTopicsSaga);
  yield takeLatest(WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS, loadOlderFollowedUsersTopicsSaga);
  yield takeLatest(WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY, loadFollowedUsersTopicsByPopularitySaga);
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

export function* loadAllTopicsSaga(action: Action) {
  if (loadAllTopicWall.match(action)) {
    const updated: number = yield select(getAllUpdatedTime);
    let topics: Topic[] = [];
    if (!action.payload.ignoreCache && !cacheExpired(updated)) {
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
      retrievedTopics = yield getTopicsAfterTimestamp(topics[0].last_modified, action.payload.pageSize);
      couldExistOlder = yield select(getAllCouldExistOlder);
    } else {
      retrievedTopics = yield getTopicsPriorToTimestamp(Date.now(), action.payload.pageSize);
      couldExistOlder = retrievedTopics.length >= action.payload.pageSize;
    }

    yield put(
      updateTopics({
        topics: retrievedTopics.concat(removeDuplicateTopicsFromFirst(topics, retrievedTopics)),
        couldExistOlder,
        wallType: WallType.ALL
      })
    );

    yield put(setQueryPending(false));
  }
}

export function* loadOlderAllTopicsSaga(action: Action) {
  if (loadOlderAllTopics.match(action)) {
    const topics: Topic[] = yield select(getAllTopics);
    yield put(setQueryPending(true));

    let retrievedTopics: Topic[] = [];
    if (topics.length > 0) {
      retrievedTopics = yield getTopicsPriorToTimestamp(topics[topics.length - 1].last_modified, action.payload);
    } else {
      retrievedTopics = yield getTopicsPriorToTimestamp(Date.now(), action.payload);
    }

    const updatedTopics: Topic[] = topics.concat(retrievedTopics);

    yield put(updateTopics({
      topics: updatedTopics,
      couldExistOlder: retrievedTopics.length >= action.payload,
      wallType: WallType.ALL
    }));
    yield put(setQueryPending(false));
  }
}

export function* loadAllTopicsByPopularitySaga(action: Action) {
  if (loadAllTopicsByPopularity.match(action)) {
    yield put(setQueryPending(true));
    const topics: Topic[] = yield getAllTopicsByPopularityAfterTimestamp(action.payload.timestamp, action.payload.pageSize);
    yield put(updateTopics({ topics, couldExistOlder: false, wallType: WallType.NONE }));
    yield put(setQueryPending(false));
  }
}

export function* loadFollowedUsersTopicsSaga(action: Action) {
  if (loadFollowedUsersTopicWall.match(action)) {
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
        action.payload.username,
        topics[0].last_modified,
        action.payload.pageSize
      );
      couldExistOlder = yield select(getFollowedUsersCouldExistOlder);
    } else {
      retrievedTopics = yield getTopicsFromFollowsPriorToTimestamp(action.payload.username, Date.now(), action.payload.pageSize);
      couldExistOlder = retrievedTopics.length >= action.payload.pageSize;
    }

    yield put(
      updateTopics({
        topics: retrievedTopics.concat(removeDuplicateTopicsFromFirst(topics, retrievedTopics)),
        couldExistOlder,
        wallType: WallType.USER
      })
    );

    yield put(setQueryPending(false));
  }
}

export function* loadOlderFollowedUsersTopicsSaga(action: Action) {
  if (loadOlderFollowedUsersTopics.match(action)) {
    const topics: Topic[] = yield select(getFollowedUsersTopics);

    let retrievedTopics: Topic[] = [];
    if (topics.length > 0) {
      yield put(setQueryPending(true));
      retrievedTopics = yield getTopicsFromFollowsPriorToTimestamp(
        action.payload.username,
        topics[topics.length - 1].last_modified,
        action.payload.pageSize
      );
    }

    yield put(updateTopics({
      topics: topics.concat(retrievedTopics),
      couldExistOlder: retrievedTopics.length >= action.payload.pageSize,
      wallType: WallType.USER
    }));
    yield put(setQueryPending(false));
  }
}

export function* loadFollowedUsersTopicsByPopularitySaga(action: Action) {
  if (loadFollowedUsersTopicsByPopularity.match(action)) {
    yield put(setQueryPending(true));
    const topics: Topic[] = yield getTopicsByFollowsSortedByPopularityAfterTimestamp(
      action.payload.username,
      action.payload.timestamp,
      action.payload.pageSize
    );
    yield put(updateTopics({ topics, couldExistOlder: false, wallType: WallType.NONE }));
    yield put(setQueryPending(false));
  }
}

export function* loadFollowedChannelsTopicsSaga(action: Action) {
  if (loadFollowedChannelsTopicWall.match(action)) {
    const updated: number = yield select(getFollowedChannelsUpdatedTime);

    if (!action.payload.ignoreCache && !cacheExpired(updated)) {
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
        action.payload.username,
        topics[0].last_modified,
        action.payload.pageSize
      );
      couldExistOlder = yield select(getFollowedChannelsCouldExistOlder);
    } else {
      retrievedTopics = yield getTopicsFromFollowedChannelsPriorToTimestamp(action.payload.username, Date.now(), action.payload.pageSize);
      couldExistOlder = retrievedTopics.length >= action.payload.pageSize;
    }

    yield put(
      updateTopics({
        topics: retrievedTopics.concat(removeDuplicateTopicsFromFirst(topics, retrievedTopics)),
        couldExistOlder,
        wallType: WallType.CHANNEL
      })
    );
    yield put(setQueryPending(false));
  }
}

export function* loadOlderFollowedChannelsTopicsSaga(action: Action) {
  if (loadOlderFollowedChannelsTopics.match(action)) {
    const topics: Topic[] = yield select(getFollowedChannelsTopics);

    let retrievedTopics: Topic[] = [];
    if (topics.length > 0) {
      yield put(setQueryPending(true));
      retrievedTopics = yield getTopicsFromFollowedChannelsPriorToTimestamp(
        action.payload.username,
        topics[topics.length - 1].last_modified,
        action.payload.pageSize
      );
    }

    yield put(updateTopics({
      topics: topics.concat(retrievedTopics),
      couldExistOlder: retrievedTopics.length >= action.payload.pageSize,
      wallType: WallType.CHANNEL
    }));
    yield put(setQueryPending(false));
  }
}

export function* loadFollowedChannelsTopicsByPopularitySaga(action: Action) {
  if (loadFollowedChannelsTopicsByPopularity.match(action)) {
    yield put(setQueryPending(true));
    const topics: Topic[] = yield getTopicsByFollowedChannelSortedByPopularityAfterTimestamp(
      action.payload.username,
      action.payload.timestamp,
      action.payload.pageSize
    );
    yield put(updateTopics({ topics, couldExistOlder: false, wallType: WallType.NONE }));
    yield put(setQueryPending(false));
  }
}
