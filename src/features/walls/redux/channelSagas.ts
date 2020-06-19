import {
  ChannelActionTypes
} from "./channelTypes";
import { select, takeLatest, put } from "redux-saga/effects";
import ApplicationState from "../../../core/application-state";
import { Topic } from "../../../types";
import {
  getTopicsByChannelAfterTimestamp,
  getTopicsByChannelPriorToTimestamp,
  getTopicsByChannelSortedByPopularityAfterTimestamp
} from "../../../core/services/TopicService";
import { updateChannel, loadChannel, loadOlderTopicsInChannel, loadChannelByPopularity } from "./channelActions";
import { setQueryPending } from "../../../shared/redux/CommonActions";
import { Action } from "redux";

export function* channelWatcher() {
  yield takeLatest(ChannelActionTypes.LOAD_CHANNEL, loadChannelSaga);
  yield takeLatest(ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS, loadOlderTopicsInChannelSaga);
  yield takeLatest(ChannelActionTypes.LOAD_CHANNEL_POPULARITY, loadChannelByPopularitySaga);
}

export const getPreviousChannel = (state: ApplicationState) => state.channel.name;
export const getTopics = (state: ApplicationState) => state.channel.topics;

export function* loadChannelSaga(action: Action) {
  if (loadChannel.match(action)) {
    yield put(setQueryPending(true));
    const previousChannel: string = yield select(getPreviousChannel);
    const previousTopics: Topic[] = yield select(getTopics);

    let topics: Topic[] = [];
    if (action.payload.name === previousChannel && previousTopics.length > 0) {
      topics = yield getTopicsByChannelAfterTimestamp(action.payload.name, action.payload.pageSize);
      topics = topics.concat(previousTopics);
    } else {
      topics = yield getTopicsByChannelPriorToTimestamp(action.payload.name, Date.now(), action.payload.pageSize);
    }

    yield put(updateChannel({
      name: action.payload.name,
      topics: topics,
      couldExistOlder: topics.length >= action.payload.pageSize
    }));
    yield put(setQueryPending(false));
  }
}

export function* loadOlderTopicsInChannelSaga(action: Action) {
  if (loadOlderTopicsInChannel.match(action)) {
    const previousChannel: string = yield select(getPreviousChannel);
    const previousTopics: Topic[] = yield select(getTopics);

    let topics: Topic[] = [];
    if (previousTopics.length > 0) {
      yield put(setQueryPending(true));
      topics = yield getTopicsByChannelPriorToTimestamp(
        previousChannel,
        previousTopics[previousTopics.length - 1].last_modified,
        action.payload
      );
    }

    yield put(updateChannel({
      name: previousChannel,
      topics: previousTopics.concat(topics),
      couldExistOlder: topics.length >= action.payload
    }));
    yield put(setQueryPending(false));
  }
}

export function* loadChannelByPopularitySaga(action: Action) {
  if (loadChannelByPopularity.match(action)) {
    yield put(setQueryPending(true));
    const topics: Topic[] = yield getTopicsByChannelSortedByPopularityAfterTimestamp(
      action.payload.name,
      action.payload.timestamp,
      action.payload.pageSize
    );

    yield put(updateChannel({
      name: "",
      topics,
      couldExistOlder: false
    }));
    yield put(setQueryPending(false));
  }
}
