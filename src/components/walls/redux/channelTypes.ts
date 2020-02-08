import { Topic } from "../../../types";

export enum ChannelActionTypes {
  INIT_CHANNEL = "CHANNEL/INIT",
  UPDATE_CHANNEL = "CHANNEL/UPDATE",
  LOAD_CHANNEL = "CHANNEL/LOAD",
  LOAD_OLDER_CHANNEL_TOPICS = "CHANNEL/LOAD/OLDER/TOPICS",
  LOAD_CHANNEL_POPULARITY = "CHANNEL/LOAD/POPULARITY"
}

export interface ChannelInitAction {
  type: ChannelActionTypes.INIT_CHANNEL;
}

export interface UpdateChannelAction {
  type: ChannelActionTypes.UPDATE_CHANNEL;
  name: string;
  topics: Topic[];
  couldExistOlder: boolean;
}

export interface LoadChannelAction {
  type: ChannelActionTypes.LOAD_CHANNEL;
  name: string;
  pageSize: number;
}

export interface LoadOlderTopicsInChannelAction {
  type: ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS;
  pageSize: number;
}

export interface LoadChannelByPopularityAction {
  type: ChannelActionTypes.LOAD_CHANNEL_POPULARITY;
  name: string;
  timestamp: number;
  pageSize: number;
}

export type ChannelActions =
  | ChannelInitAction
  | LoadChannelAction
  | LoadOlderTopicsInChannelAction
  | LoadChannelByPopularityAction
  | UpdateChannelAction;

export interface ChannelState {
  loading: boolean;
  name: string;
  topics: Topic[];
  couldExistOlder: boolean;
}
