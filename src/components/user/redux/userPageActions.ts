import { ActionCreator } from "redux";
import {
  InitUserAction,
  LoadUserFollowedChannelsAction,
  LoadUserRepliesAction,
  LoadUserTopicsAction,
  UpdateUserFollowedChannelsAction,
  UpdateUserRepliesAction,
  UpdateUserTopicsAction,
  UserPageActionTypes
} from "./userTypes";
import { Topic, TopicReply } from "../../../types";

export const userPageInit: ActionCreator<InitUserAction> = () => ({
  type: UserPageActionTypes.INIT_USER
});

export const loadUserTopics: ActionCreator<LoadUserTopicsAction> = (username: string, pageSize: number) => ({
  type: UserPageActionTypes.LOAD_USER_TOPICS,
  username,
  pageSize
});

export const updateUserTopics: ActionCreator<UpdateUserTopicsAction> = (topics: Topic[], couldExistOlder: boolean) => ({
  type: UserPageActionTypes.UPDATE_USER_TOPICS,
  topics,
  couldExistOlderTopics: couldExistOlder
});

export const loadUserReplies: ActionCreator<LoadUserRepliesAction> = (username: string, pageSize: number) => ({
  type: UserPageActionTypes.LOAD_USER_REPLIES,
  username,
  pageSize
});

export const updateUserReplies: ActionCreator<UpdateUserRepliesAction> = (
  replies: TopicReply[],
  couldExistOlder: boolean
) => ({
  type: UserPageActionTypes.UPDATE_USER_REPLIES,
  replies: replies,
  couldExistOlderReplies: couldExistOlder
});

export const loadUserFollowedChannels: ActionCreator<LoadUserFollowedChannelsAction> = (username: string) => ({
  type: UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS,
  username
});

export const updateUserFollowedChannels: ActionCreator<UpdateUserFollowedChannelsAction> = (channels: string[]) => ({
  type: UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS,
  channels: channels
});
