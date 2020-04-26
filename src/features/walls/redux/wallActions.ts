import { ActionCreator } from "redux";
import {
  LoadAllTopicWallAction,
  LoadFollowedChannelsTopicWallAction,
  LoadOlderAllTopicsAction,
  LoadOlderFollowedChannelsTopicsAction,
  LoadOlderFollowedUsersTopicsAction,
  LoadFollowedUsersTopicWallAction,
  UpdateTopicsAction,
  WallActionTypes,
  WallType,
  LoadAllTopicsByPopularityAction,
  LoadFollowedUsersTopicsByPopularityAction,
  LoadFollowedChannelsTopicsByPopularityAction,
  UpdateTopicWallFromCacheAction, IClearTopicsCache
} from "./wallTypes";
import { Topic } from "../../../types";

export const updateTopicWallFromCache: ActionCreator<UpdateTopicWallFromCacheAction> = (wallType: WallType) => ({
  type: WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE,
  wallType: wallType
});

export const updateTopics: ActionCreator<UpdateTopicsAction> = (
  topics: Topic[],
  couldExistOlder: boolean,
  wallType: WallType
) => ({
  type: WallActionTypes.UPDATE_TOPICS_WALL,
  topics: topics,
  couldExistOlder: couldExistOlder,
  wallType: wallType
});

export const loadAllTopicWall: ActionCreator<LoadAllTopicWallAction> = (pageSize: number, ignoreCache: boolean) => ({
  type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
  pageSize: pageSize,
  ignoreCache: ignoreCache
});

export const loadOlderAllTopics: ActionCreator<LoadOlderAllTopicsAction> = (pageSize: number) => ({
  type: WallActionTypes.LOAD_OLDER_ALL_TOPICS,
  pageSize: pageSize
});

export const loadAllTopicsByPopularity: ActionCreator<LoadAllTopicsByPopularityAction> = (
  timestamp: number,
  pageSize: number
) => ({
  type: WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY,
  timestamp: timestamp,
  pageSize: pageSize
});

export const loadFollowedUsersTopicWall: ActionCreator<LoadFollowedUsersTopicWallAction> = (
  username: string,
  pageSize: number
) => ({
  type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
  username: username,
  pageSize: pageSize
});

export const loadOlderFollowedUsersTopics: ActionCreator<LoadOlderFollowedUsersTopicsAction> = (
  username: string,
  pageSize: number
) => ({
  type: WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS,
  username: username,
  pageSize: pageSize
});

export const loadFollowedUsersTopicsByPopularity: ActionCreator<LoadFollowedUsersTopicsByPopularityAction> = (
  username: string,
  timestamp: number,
  pageSize: number
) => ({
  type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY,
  username: username,
  timestamp: timestamp,
  pageSize: pageSize
});

export const loadFollowedChannelsTopicWall: ActionCreator<LoadFollowedChannelsTopicWallAction> = (
  username: string,
  pageSize: number,
  ignoreCache: boolean
) => ({
  type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL,
  username: username,
  pageSize: pageSize,
  ignoreCache: ignoreCache
});

export const loadOlderFollowedChannelsTopics: ActionCreator<LoadOlderFollowedChannelsTopicsAction> = (
  username: string,
  pageSize: number
) => ({
  type: WallActionTypes.LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS,
  username: username,
  pageSize: pageSize
});

export const loadFollowedChannelsTopicsByPopularity: ActionCreator<LoadFollowedChannelsTopicsByPopularityAction> = (
  username: string,
  timestamp: number,
  pageSize: number
) => ({
  type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY,
  username: username,
  timestamp: timestamp,
  pageSize: pageSize
});

export const clearTopicsCache: ActionCreator<IClearTopicsCache> = () => ({
  type: WallActionTypes.CLEAR_TOPICS_CACHE
});
