import { ChannelActions, ChannelActionTypes, ChannelState } from "./channelTypes";
import { Reducer } from "redux";

const initialChannelState: ChannelState = {
  name: "",
  topics: [],
  couldExistOlder: false
};

export const channelReducer: Reducer<ChannelState, ChannelActions> = (state = initialChannelState, action) => {
  switch (action.type) {
    case ChannelActionTypes.INIT_CHANNEL: {
      return {
        ...state,
        topics: []
      };
    }
    case ChannelActionTypes.UPDATE_CHANNEL: {
      return {
        ...state,
        name: action.name,
        topics: action.topics,
        couldExistOlder: action.couldExistOlder
      };
    }
  }

  return state;
};
