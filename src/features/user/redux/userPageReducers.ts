import { UserPageState } from "./userTypes";
import { createReducer } from "@reduxjs/toolkit";
import { userPageInit, updateUserTopics, updateUserReplies, updateUserFollowedChannels } from "./userPageActions";

const initialUserPageState: UserPageState = {
  topics: [],
  couldExistOlderTopics: false,
  replies: [],
  couldExistOlderReplies: false,
  followedChannels: []
};

export const userPageReducer = createReducer(initialUserPageState, builder =>
  builder
    .addCase(userPageInit, (state, _) => {
      state.topics = [];
      state.replies = [];
      state.followedChannels = [];
      state.couldExistOlderReplies = false;
      state.couldExistOlderTopics = false;
    })
    .addCase(updateUserTopics, (state, action) => {
      state.topics = action.payload.topics;
      state.couldExistOlderTopics = action.payload.couldExistOlderTopics;
    })
    .addCase(updateUserReplies, (state, action) => {
      state.replies = action.payload.replies;
      state.couldExistOlderReplies = action.payload.couldExistOlderReplies;
    })
    .addCase(updateUserFollowedChannels, (state, action) => {
      state.followedChannels = action.payload;
    })
)
