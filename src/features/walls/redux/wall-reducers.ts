import { createReducer } from '@reduxjs/toolkit';
import { TopicWallState, WallType } from './wall-types';
import { updateTopicWallFromCache, updateTopics, clearTopicsCache } from './wall-actions';

const initialTopicWallState: TopicWallState = {
  topics: [],
  couldExistOlder: false,
  all: {
    topics: [],
    updated: 0,
    couldExistOlder: false,
  },
  followedChannels: {
    topics: [],
    updated: 0,
    couldExistOlder: false,
  },
  followedUsers: {
    topics: [],
    updated: 0,
    couldExistOlder: false,
  },
};

export const topicWallReducer = createReducer(initialTopicWallState, (builder) =>
  builder
    .addCase(updateTopicWallFromCache, (state, action) => {
      switch (action.payload) {
        case WallType.ALL: {
          state.topics = state.all.topics;
          state.couldExistOlder = state.all.couldExistOlder;
          break;
        }
        case WallType.CHANNEL: {
          state.topics = state.followedChannels.topics;
          state.couldExistOlder = state.followedChannels.couldExistOlder;
          break;
        }
        case WallType.USER: {
          state.topics = state.followedUsers.topics;
          state.couldExistOlder = state.followedUsers.couldExistOlder;
          break;
        }
        default:
          break;
      }
    })
    .addCase(updateTopics, (state, action) => {
      state.topics = action.payload.topics;
      state.couldExistOlder = action.payload.couldExistOlder;

      switch (action.payload.wallType) {
        case WallType.ALL: {
          state.all.topics = action.payload.topics;
          state.all.couldExistOlder = action.payload.couldExistOlder;
          state.all.updated = Date.now();
          break;
        }
        case WallType.CHANNEL: {
          state.followedChannels.topics = action.payload.topics;
          state.followedChannels.couldExistOlder = action.payload.couldExistOlder;
          state.followedChannels.updated = Date.now();
          break;
        }
        case WallType.USER: {
          state.followedUsers.topics = action.payload.topics;
          state.followedUsers.couldExistOlder = action.payload.couldExistOlder;
          state.followedUsers.updated = Date.now();
          break;
        }
        default:
          break;
      }
    })
    .addCase(clearTopicsCache, (state) => {
      state.followedChannels.topics = [];
      state.followedChannels.couldExistOlder = false;
      state.followedChannels.updated = 0;
      state.followedUsers.topics = [];
      state.followedUsers.couldExistOlder = false;
      state.followedUsers.updated = 0;
    })
);
