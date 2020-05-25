import { Topic } from "../../../types";

export enum WallActionTypes {
  UPDATE_TOPICS_WALL_FROM_CACHE = "WALL/TOPICS/UPDATE/CACHE",
  UPDATE_TOPICS_WALL = "WALL/TOPICS/UPDATE",
  LOAD_ALL_TOPIC_WALL = "WALL/TOPIC/ALL/LOAD",
  LOAD_OLDER_ALL_TOPICS = "WALL/TOPIC/ALL/OLDER",
  LOAD_ALL_TOPICS_BY_POPULARITY = "WALL/TOPIC/ALL/POPULARITY",
  LOAD_FOLLOWED_USERS_TOPIC_WALL = "WALL/TOPIC/FOLLOWED/USERS/LOAD",
  LOAD_OLDER_FOLLOWED_USERS_TOPICS = "WALL/TOPIC/FOLLOWED/USERS/OLDER",
  LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY = "WALL/TOPIC/FOLLOWED/USERS/POPULARITY",
  LOAD_FOLLOWED_CHANNELS_TOPIC_WALL = "WALL/TOPIC/CHANNEL/LOAD",
  LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS = "WALL/TOPIC/CHANNEL/OLDER",
  LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY = "WALL/TOPIC/FOLLOWED/CHANNELS/POPULARITY",
  CLEAR_TOPICS_CACHE = "WALL/TOPIC/CHANNELS/CLEAR"
}

export enum WallType {
  NONE,
  ALL,
  USER,
  CHANNEL
}

export interface UpdateTopicWallFromCacheAction {
  type: WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE;
  wallType: WallType;
}

export interface UpdateTopicsAction {
  type: WallActionTypes.UPDATE_TOPICS_WALL;
  topics: Topic[];
  couldExistOlder: boolean;
  wallType: WallType;
}

export interface LoadAllTopicWallAction {
  type: WallActionTypes.LOAD_ALL_TOPIC_WALL;
  pageSize: number;
  ignoreCache: boolean;
}

export interface LoadOlderAllTopicsAction {
  type: WallActionTypes.LOAD_OLDER_ALL_TOPICS;
  pageSize: number;
}

export interface LoadAllTopicsByPopularityAction {
  type: WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY;
  timestamp: number;
  pageSize: number;
}

export interface LoadFollowedUsersTopicWallAction {
  type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL;
  username: string;
  pageSize: number;
}

export interface LoadOlderFollowedUsersTopicsAction {
  type: WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS;
  username: string;
  pageSize: number;
}

export interface LoadFollowedUsersTopicsByPopularityAction {
  type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY;
  username: string;
  timestamp: number;
  pageSize: number;
}

export interface LoadFollowedChannelsTopicWallAction {
  type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL;
  username: string;
  pageSize: number;
  ignoreCache: boolean;
}

export interface LoadOlderFollowedChannelsTopicsAction {
  type: WallActionTypes.LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS;
  username: string;
  pageSize: number;
}

export interface LoadFollowedChannelsTopicsByPopularityAction {
  type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY;
  username: string;
  timestamp: number;
  pageSize: number;
}

export interface IClearTopicsCache {
  type: WallActionTypes.CLEAR_TOPICS_CACHE
}

export type TopicWallActions =
  | UpdateTopicWallFromCacheAction
  | UpdateTopicsAction
  | LoadAllTopicWallAction
  | LoadOlderAllTopicsAction
  | LoadAllTopicsByPopularityAction
  | LoadFollowedUsersTopicWallAction
  | LoadOlderFollowedUsersTopicsAction
  | LoadFollowedUsersTopicsByPopularityAction
  | LoadFollowedChannelsTopicWallAction
  | LoadOlderFollowedChannelsTopicsAction
  | LoadFollowedChannelsTopicsByPopularityAction
  | IClearTopicsCache;

export interface TopicWallState {
  topics: Topic[];
  couldExistOlder: boolean;
  all: {
    topics: Topic[];
    updated: number;
    couldExistOlder: boolean;
  },
  followedChannels: {
    topics: Topic[];
    updated: number;
    couldExistOlder: boolean;
  },
  followedUsers: {
    topics: Topic[];
    updated: number;
    couldExistOlder: boolean;
  }
}
