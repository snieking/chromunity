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

export interface IUpdateTopics {
  topics: Topic[];
  couldExistOlder: boolean;
  wallType: WallType;
}

export interface ILoadAllTopicWall {
  pageSize: number;
  ignoreCache: boolean;
}

export interface ILoadAllTopicsByPopularity {
  timestamp: number;
  pageSize: number;
}

export interface ILoadFollowedUsersTopicWall {
  username: string;
  pageSize: number;
}

export interface ILoadOlderFollowedUsersTopics {
  username: string;
  pageSize: number;
}

export interface ILoadFollowedUsersTopicsByPopularity {
  username: string;
  timestamp: number;
  pageSize: number;
}

export interface ILoadFollowedChannelsTopicWall {
  username: string;
  pageSize: number;
  ignoreCache: boolean;
}

export interface ILoadOlderFollowedChannelsTopics {
  username: string;
  pageSize: number;
}

export interface ILoadFollowedChannelsTopicsByPopularity {
  username: string;
  timestamp: number;
  pageSize: number;
}

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
