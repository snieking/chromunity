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
} from "../WallTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import { Topic } from "../../types";
import {
  getAllTopicsByPopularityAfterTimestamp,
  getTopicsAfterTimestamp,
  getTopicsByFollowedChannelSortedByPopularityAfterTimestamp,
  getTopicsByFollowsSortedByPopularityAfterTimestamp,
  getTopicsFromFollowedChannelsPriorToTimestamp,
  getTopicsFromFollowsAfterTimestamp,
  getTopicsFromFollowsPriorToTimestamp,
  getTopicsPriorToTimestamp
} from "../../blockchain/TopicService";
import { updateTopicWallFromCache, updateTopics } from "../actions/WallActions";
import { ApplicationState } from "../Store";

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

export const getFollowedChannelsTopics = (state: ApplicationState) => state.topicWall.followedChannels.topics;
export const getFollowedChannelsUpdatedTime = (state: ApplicationState) => state.topicWall.followedChannels.updated;

export const getFollowedUsersTopics = (state: ApplicationState) => state.topicWall.followedUsers.topics;
export const getFollowedUsersUpdatedTime = (state: ApplicationState) => state.topicWall.followedUsers.updated;

const CACHE_DURATION_MILLIS = 1000 * 60;

const cacheExpired = (updated: number): boolean => {
  return Date.now() - updated > CACHE_DURATION_MILLIS;
};

export function* loadAllTopics(action: LoadAllTopicWallAction) {
  const updated: number = yield select(getAllUpdatedTime);

  let topics: Topic[] = [];
  if (!cacheExpired(updated)) {
    console.log("Using cached all wall topics, previously updated at: ", updated);
    yield put(updateTopicWallFromCache(WallType.ALL));
    return;
  } else {
    topics = yield select(getAllTopics);
    console.log("Returning new wall: ", topics);
  }

  let couldExistOlder: boolean = topics.length <= action.pageSize;

  let retrievedTopics: Topic[];
  if (topics.length > 0) {
    console.log("Length was more than 0: ", topics, "fetching topics after timestamp: ", topics[0].last_modified);
    // Load recent topics
    retrievedTopics = yield getTopicsAfterTimestamp(topics[0].last_modified, action.pageSize);
  } else {
    console.log("Getting topics prior to current timestamp");
    retrievedTopics = yield getTopicsPriorToTimestamp(Date.now(), action.pageSize);
    couldExistOlder = retrievedTopics.length >= action.pageSize;
  }

  yield put(updateTopics(retrievedTopics.concat(topics), couldExistOlder, WallType.ALL));
}

export function* loadOlderAllTopics(action: LoadOlderAllTopicsAction) {
  const topics: Topic[] = yield select(getAllTopics);

  let retrievedTopics: Topic[] = [];
  if (topics.length > 0) {
    console.log("Searching timestamp older than: ", topics[topics.length - 1].last_modified);
    retrievedTopics = yield getTopicsPriorToTimestamp(topics[topics.length - 1].last_modified, action.pageSize);
  } else {
    retrievedTopics = yield getTopicsPriorToTimestamp(Date.now(), action.pageSize);
  }

  const updatedTopics: Topic[] = topics.concat(retrievedTopics);
  console.log("Topics length: ", updatedTopics.length);

  yield put(updateTopics(updatedTopics, retrievedTopics.length >= action.pageSize, WallType.ALL));
}

export function* loadAllTopicsByPopularity(action: LoadAllTopicsByPopularityAction) {
  const topics: Topic[] = yield getAllTopicsByPopularityAfterTimestamp(action.timestamp, action.pageSize);
  yield put(updateTopics(topics, false, WallType.NONE));
}

export function* loadFollowedUsersTopics(action: LoadFollowedUsersTopicWallAction) {
  const updated: number = yield select(getFollowedUsersUpdatedTime);

  if (!cacheExpired(updated)) {
    console.log("Using cached followed users topics, previously updated at: ", updated);
    yield put(updateTopicWallFromCache(WallType.USER));
    return;
  }

  console.log("Returning updated followed users wall");
  const topics: Topic[] = yield select(getFollowedUsersTopics);

  let retrievedTopics: Topic[];
  if (topics.length > 0) {
    retrievedTopics = yield getTopicsFromFollowsAfterTimestamp(
      action.username,
      topics[0].last_modified,
      action.pageSize
    );
  } else {
    retrievedTopics = yield getTopicsFromFollowsPriorToTimestamp(action.username, Date.now(), action.pageSize);
  }

  yield put(updateTopics(topics.concat(retrievedTopics), retrievedTopics.length >= action.pageSize, WallType.USER));
}

export function* loadOlderFollowedUsersTopics(action: LoadOlderFollowedUsersTopicsAction) {
  const topics: Topic[] = yield select(getFollowedUsersTopics);

  let retrievedTopics: Topic[] = [];
  if (topics.length > 0) {
    retrievedTopics = yield getTopicsFromFollowsPriorToTimestamp(
      action.username,
      topics[topics.length - 1].last_modified,
      action.pageSize
    );
  }

  yield put(updateTopics(topics.concat(retrievedTopics), retrievedTopics.length >= action.pageSize, WallType.USER));
}

export function* loadFollowedUsersTopicsByPopularity(action: LoadFollowedUsersTopicsByPopularityAction) {
  const topics: Topic[] = yield getTopicsByFollowsSortedByPopularityAfterTimestamp(
    action.username,
    action.timestamp,
    action.pageSize
  );
  yield put(updateTopics(topics, false, WallType.NONE));
}

export function* loadFollowedChannelsTopics(action: LoadFollowedChannelsTopicWallAction) {
  const updated: number = yield select(getFollowedChannelsUpdatedTime);

  if (!cacheExpired(updated)) {
    console.log("Using cached followed channels topics, previously updated at: ", updated);
    yield put(updateTopicWallFromCache(WallType.CHANNEL));
    return;
  }

  console.log("Returning updated followed channels wall");
  const topics: Topic[] = yield select(getFollowedChannelsTopics);

  let retrievedTopics: Topic[];
  if (topics.length > 0) {
    // Load recent topics
    retrievedTopics = yield getTopicsFromFollowedChannelsPriorToTimestamp(
      action.username,
      topics[0].last_modified,
      action.pageSize
    );
  } else {
    retrievedTopics = yield getTopicsFromFollowedChannelsPriorToTimestamp(action.username, Date.now(), action.pageSize);
  }

  yield put(updateTopics(retrievedTopics.concat(topics), retrievedTopics.length >= action.pageSize, WallType.CHANNEL));
}

export function* loadOlderFollowedChannelsTopics(action: LoadOlderFollowedChannelsTopicsAction) {
  const topics: Topic[] = yield select(getFollowedChannelsTopics);

  let retrievedTopics: Topic[] = [];
  if (topics.length > 0) {
    retrievedTopics = yield getTopicsFromFollowedChannelsPriorToTimestamp(
      action.username,
      topics[topics.length - 1].last_modified,
      action.pageSize
    );
  }

  yield put(updateTopics(topics.concat(retrievedTopics), retrievedTopics.length >= action.pageSize, WallType.CHANNEL));
}

export function* loadFollowedChannelsTopicsByPopularity(action: LoadFollowedChannelsTopicsByPopularityAction) {
  const topics: Topic[] = yield getTopicsByFollowedChannelSortedByPopularityAfterTimestamp(
    action.username,
    action.timestamp,
    action.pageSize
  );
  yield put(updateTopics(topics, false, WallType.NONE));
}
