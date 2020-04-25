import {
  ChannelActionTypes,
  LoadChannelAction,
  LoadChannelByPopularityAction,
  LoadOlderTopicsInChannelAction
} from "./channelTypes";
import { select, takeLatest, put } from "redux-saga/effects";
import { ApplicationState } from "../../../core/store";
import { Topic } from "../../../types";
import {
  getTopicsByChannelAfterTimestamp,
  getTopicsByChannelPriorToTimestamp,
  getTopicsByChannelSortedByPopularityAfterTimestamp
} from "../../../core/services/TopicService";
import { updateChannel } from "./channelActions";

export function* channelWatcher() {
  yield takeLatest(ChannelActionTypes.LOAD_CHANNEL, loadChannel);
  yield takeLatest(ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS, loadOlderTopicsInChannel);
  yield takeLatest(ChannelActionTypes.LOAD_CHANNEL_POPULARITY, loadChannelByPopularity);
}

export const getPreviousChannel = (state: ApplicationState) => state.channel.name;
export const getTopics = (state: ApplicationState) => state.channel.topics;

export function* loadChannel(action: LoadChannelAction) {
  const previousChannel: string = yield select(getPreviousChannel);
  const previousTopics: Topic[] = yield select(getTopics);

  let topics: Topic[] = [];
  if (action.name === previousChannel && previousTopics.length > 0) {
    topics = yield getTopicsByChannelAfterTimestamp(action.name, action.pageSize);
    topics = topics.concat(previousTopics);
  } else {
    topics = yield getTopicsByChannelPriorToTimestamp(action.name, Date.now(), action.pageSize);
  }

  yield put(updateChannel(action.name, topics, topics.length >= action.pageSize));
}

export function* loadOlderTopicsInChannel(action: LoadOlderTopicsInChannelAction) {
  const previousChannel: string = yield select(getPreviousChannel);
  const previousTopics: Topic[] = yield select(getTopics);

  let topics: Topic[] = [];
  if (previousTopics.length > 0) {
    topics = yield getTopicsByChannelPriorToTimestamp(
      previousChannel,
      previousTopics[previousTopics.length - 1].last_modified,
      action.pageSize
    );
  }

  yield put(updateChannel(previousChannel, previousTopics.concat(topics), topics.length >= action.pageSize));
}

export function* loadChannelByPopularity(action: LoadChannelByPopularityAction) {
  const topics: Topic[] = yield getTopicsByChannelSortedByPopularityAfterTimestamp(
    action.name,
    action.timestamp,
    action.pageSize
  );

  yield put(updateChannel("", topics, false));
}
