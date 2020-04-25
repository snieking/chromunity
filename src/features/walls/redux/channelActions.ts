import { ActionCreator } from "redux";
import {
  ChannelActionTypes, ChannelInitAction,
  LoadChannelAction,
  LoadChannelByPopularityAction,
  LoadOlderTopicsInChannelAction,
  UpdateChannelAction
} from "./channelTypes";
import { Topic } from "../../../types";

export const channelInit: ActionCreator<ChannelInitAction> = () => ({
  type: ChannelActionTypes.INIT_CHANNEL
});

export const loadChannel: ActionCreator<LoadChannelAction> = (name: string, pageSize: number) => ({
  type: ChannelActionTypes.LOAD_CHANNEL,
  name: name,
  pageSize: pageSize
});

export const loadOlderTopicsInChannel: ActionCreator<LoadOlderTopicsInChannelAction> = (pageSize: number) => ({
  type: ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS,
  pageSize: pageSize
});

export const loadChannelByPopularity: ActionCreator<LoadChannelByPopularityAction> = (
  name: string,
  timestamp: number,
  pageSize: number
) => ({
  type: ChannelActionTypes.LOAD_CHANNEL_POPULARITY,
  name: name,
  timestamp: timestamp,
  pageSize: pageSize
});

export const updateChannel: ActionCreator<UpdateChannelAction> = (
  name: string,
  topics: Topic[],
  couldExistOlder: boolean
) => ({
  type: ChannelActionTypes.UPDATE_CHANNEL,
  name: name,
  topics: topics,
  couldExistOlder: couldExistOlder
});
