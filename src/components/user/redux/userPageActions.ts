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

export const userPageInit: ActionCreator<InitUserAction> = (username: string) => ({
  type: UserPageActionTypes.INIT_USER,
  username: username
});

export const loadUserTopics: ActionCreator<LoadUserTopicsAction> = (pageSize: number) => ({
  type: UserPageActionTypes.LOAD_USER_TOPICS,
  pageSize: pageSize
});

export const updateUserTopics: ActionCreator<UpdateUserTopicsAction> = (topics: Topic[], couldExistOlder: boolean) => ({
  type: UserPageActionTypes.UPDATE_USER_TOPICS,
  topics: topics,
  couldExistOlderTopics: couldExistOlder
});

export const loadUserReplies: ActionCreator<LoadUserRepliesAction> = (pageSize: number) => ({
  type: UserPageActionTypes.LOAD_USER_REPLIES,
  pageSize: pageSize
});

export const updateUserReplies: ActionCreator<UpdateUserRepliesAction> = (
  replies: TopicReply[],
  couldExistOlder: boolean
) => ({
  type: UserPageActionTypes.UPDATE_USER_REPLIES,
  replies: replies,
  couldExistOlderReplies: couldExistOlder
});

export const loadUserFollowedChannels: ActionCreator<LoadUserFollowedChannelsAction> = () => ({
  type: UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS
});

export const updateUserFollowedChannels: ActionCreator<UpdateUserFollowedChannelsAction> = (channels: string[]) => ({
  type: UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS,
  channels: channels
});
