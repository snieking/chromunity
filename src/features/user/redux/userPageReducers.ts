import { UserPageActions, UserPageActionTypes, UserPageState } from "./userTypes";
import { Reducer } from "redux";

const initialUserPageState: UserPageState = {
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
        topics: action.topics,
        couldExistOlderTopics: action.couldExistOlderTopics
      }
    }
    case UserPageActionTypes.UPDATE_USER_REPLIES: {
      return {
        ...state,
        replies: action.replies,
        couldExistOlderReplies: action.couldExistOlderReplies
      }
    }
    case UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS: {
      return {
        ...state,
        followedChannels: action.channels
      }
    }
  }

  return state;
};
