import {
  WallActionTypes,
  WallType,
  IUpdateTopics,
  ILoadAllTopicWall,
  ILoadAllTopicsByPopularity,
  ILoadFollowedUsersTopicWall,
  ILoadOlderFollowedUsersTopics,
  ILoadFollowedUsersTopicsByPopularity,
  ILoadFollowedChannelsTopicWall,
  ILoadOlderFollowedChannelsTopics,
  ILoadFollowedChannelsTopicsByPopularity
} from "./wall-types";
import { createAction } from "@reduxjs/toolkit";
import { withPayloadType } from "../../../shared/redux/util";

export const updateTopicWallFromCache = createAction(WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE, withPayloadType<WallType>());

export const updateTopics = createAction(WallActionTypes.UPDATE_TOPICS_WALL, withPayloadType<IUpdateTopics>());

export const loadAllTopicWall = createAction(WallActionTypes.LOAD_ALL_TOPIC_WALL, withPayloadType<ILoadAllTopicWall>());

export const loadOlderAllTopics = createAction(WallActionTypes.LOAD_OLDER_ALL_TOPICS, withPayloadType<number>());

export const loadAllTopicsByPopularity = createAction(WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY, withPayloadType<ILoadAllTopicsByPopularity>());

export const loadFollowedUsersTopicWall = createAction(WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL, withPayloadType<ILoadFollowedUsersTopicWall>());

export const loadOlderFollowedUsersTopics = createAction(WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS, withPayloadType<ILoadOlderFollowedUsersTopics>());

export const loadFollowedUsersTopicsByPopularity = createAction(WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY, withPayloadType<ILoadFollowedUsersTopicsByPopularity>());

export const loadFollowedChannelsTopicWall = createAction(WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL, withPayloadType<ILoadFollowedChannelsTopicWall>());

export const loadOlderFollowedChannelsTopics = createAction(WallActionTypes.LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS, withPayloadType<ILoadOlderFollowedChannelsTopics>());

export const loadFollowedChannelsTopicsByPopularity = createAction(WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY, withPayloadType<ILoadFollowedChannelsTopicsByPopularity>());

export const clearTopicsCache = createAction(WallActionTypes.CLEAR_TOPICS_CACHE);
