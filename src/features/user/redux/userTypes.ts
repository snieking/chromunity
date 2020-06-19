import { Topic, TopicReply } from "../../../types";

export enum UserPageActionTypes {
  INIT_USER = "USER/PAGE/INIT",
  LOAD_USER_TOPICS = "USER/PAGE/TOPICS/LOAD",
  UPDATE_USER_TOPICS = "USER/PAGE/TOPICS/UPDATE",
  LOAD_USER_REPLIES = "USER/PAGE/REPLIES/LOAD",
  UPDATE_USER_REPLIES = "USER/PAGE/REPLIES/UPDATE",
  LOAD_USER_FOLLOWED_CHANNELS = "USER/PAGE/FOLLOWED_CHANNELS/LOAD",
  UPDATE_USER_FOLLOWED_CHANNELS = "USER/PAGE/FOLLOWED_CHANNELS/UPDATE"
}

export interface ILoadUserTopics {
  username: string;
  pageSize: number;
}

export interface IUpdateUserTopics {
  topics: Topic[];
  couldExistOlderTopics: boolean;
}

export interface ILoadUserReplies {
  username: string;
  pageSize: number;
}

export interface IUpdateUserReplies {
  replies: TopicReply[];
  couldExistOlderReplies: boolean;
}

export interface UserPageState {
  topics: Topic[];
  couldExistOlderTopics: boolean;
  replies: TopicReply[];
  couldExistOlderReplies: boolean;
  followedChannels: string[];
}
