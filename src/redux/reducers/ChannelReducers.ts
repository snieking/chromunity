import { ChannelActions, ChannelActionTypes, ChannelState } from "../ChannelTypes";
import { Reducer } from "redux";

const initialChannelState: ChannelState = {
  loading: false,
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
    case ChannelActionTypes.LOAD_CHANNEL: {
      return {
        ...state,
        loading: true
      };
    }
    case ChannelActionTypes.UPDATE_CHANNEL: {
      return {
        ...state,
        loading: false,
        name: action.name,
        topics: action.topics,
        couldExistOlder: action.couldExistOlder
      };
    }
    case ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS: {
      return {
        ...state,
        loading: false
      };
    }
    case ChannelActionTypes.LOAD_CHANNEL_POPULARITY: {
      return {
        ...state,
        loading: false
      };
    }
  }

  return state;
};
