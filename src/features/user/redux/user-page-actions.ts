import { createAction } from '@reduxjs/toolkit';
import {
  UserPageActionTypes,
  ILoadUserTopics,
  IUpdateUserTopics,
  ILoadUserReplies,
  IUpdateUserReplies,
} from './user-types';
import { withPayloadType } from '../../../shared/redux/util';

export const userPageInit = createAction(UserPageActionTypes.INIT_USER);

export const loadUserTopics = createAction(UserPageActionTypes.LOAD_USER_TOPICS, withPayloadType<ILoadUserTopics>());

export const updateUserTopics = createAction(
  UserPageActionTypes.UPDATE_USER_TOPICS,
  withPayloadType<IUpdateUserTopics>()
);

export const loadUserReplies = createAction(UserPageActionTypes.LOAD_USER_REPLIES, withPayloadType<ILoadUserReplies>());

export const updateUserReplies = createAction(
  UserPageActionTypes.UPDATE_USER_REPLIES,
  withPayloadType<IUpdateUserReplies>()
);

export const loadUserFollowedChannels = createAction(
  UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS,
  withPayloadType<string>()
);

export const updateUserFollowedChannels = createAction(
  UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS,
  withPayloadType<string[]>()
);
