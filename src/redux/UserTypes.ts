import { Topic, TopicReply } from "../types";

export enum UserPageActionTypes {
  INIT_USER = "USER/PAGE/INIT",
  LOAD_USER_TOPICS = "USER/PAGE/TOPICS/LOAD",
  UPDATE_USER_TOPICS = "USER/PAGE/TOPICS/UPDATE",
  LOAD_USER_REPLIES = "USER/PAGE/REPLIES/LOAD",
  UPDATE_USER_REPLIES = "USER/PAGE/REPLIES/UPDATE",
  LOAD_USER_FOLLOWED_CHANNELS = "USER/PAGE/FOLLOWED_CHANNELS/LOAD",
  UPDATE_USER_FOLLOWED_CHANNELS = "USER/PAGE/FOLLOWED_CHANNELS/UPDATE"
}

export interface InitUserAction {
  type: UserPageActionTypes.INIT_USER;
  username: string;
}

export interface LoadUserTopicsAction {
  type: UserPageActionTypes.LOAD_USER_TOPICS;
  pageSize: number;
}

export interface UpdateUserTopicsAction {
  type: UserPageActionTypes.UPDATE_USER_TOPICS;
  topics: Topic[];
  couldExistOlderTopics: boolean;
}

export interface LoadUserRepliesAction {
  type: UserPageActionTypes.LOAD_USER_REPLIES;
  pageSize: number;
}

export interface UpdateUserRepliesAction {
  type: UserPageActionTypes.UPDATE_USER_REPLIES;
  replies: TopicReply[];
  couldExistOlderReplies: boolean;
}

export interface LoadUserFollowedChannelsAction {
  type: UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS;
}

export interface UpdateUserFollowedChannelsAction {
  type: UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS;
  channels: string[];
}

export type UserPageActions =
  | InitUserAction
  | LoadUserTopicsAction
  | UpdateUserTopicsAction
  | LoadUserRepliesAction
  | UpdateUserRepliesAction
  | LoadUserFollowedChannelsAction
  | UpdateUserFollowedChannelsAction;

export interface UserPageState {
  loading: boolean;
  username: string;
  topics: Topic[];
  couldExistOlderTopics: boolean;
  replies: TopicReply[];
  couldExistOlderReplies: boolean;
  followedChannels: string[];
}
