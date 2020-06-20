import { createReducer } from '@reduxjs/toolkit';
import { ChannelState } from './channel-types';
import { channelInit, updateChannel } from './channel-actions';

const initialChannelState: ChannelState = {
  name: '',
  topics: [],
  couldExistOlder: false,
};

export const channelReducer = createReducer(initialChannelState, (builder) =>
  builder
    .addCase(channelInit, (state) => {
      state.topics = [];
    })
    .addCase(updateChannel, (state, action) => {
      state.name = action.payload.name;
      state.topics = action.payload.topics;
      state.couldExistOlder = action.payload.couldExistOlder;
    })
);
