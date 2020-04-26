import { UserPageActions, UserPageActionTypes, UserPageState } from "./userTypes";
import { Reducer } from "redux";

const initialUserPageState: UserPageState = {
  loading: false,
  topics: [],
  couldExistOlderTopics: false,
  replies: [],
  couldExistOlderReplies: false,
  followedChannels: []
};

export const userPageReducer: Reducer<UserPageState, UserPageActions> = (state = initialUserPageState, action) => {
  switch (action.type) {
    case UserPageActionTypes.INIT_USER: {
      return {
        ...state,
        loading: true,
        topics: [],
        replies: [],
        followedChannels: [],
        couldExistOlderReplies: false,
        couldExistOlderTopics: false
      }
    }
    case UserPageActionTypes.UPDATE_USER_TOPICS: {
      return {
        ...state,
        loading: false,
        topics: action.topics,
        couldExistOlderTopics: action.couldExistOlderTopics
      }
    }
    case UserPageActionTypes.UPDATE_USER_REPLIES: {
      return {
        ...state,
        loading: false,
        replies: action.replies,
        couldExistOlderReplies: action.couldExistOlderReplies
      }
    }
    case UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS: {
      return {
        ...state,
        loading: false,
        followedChannels: action.channels
      }
    }
  }

  return state;
};