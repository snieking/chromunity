import { UserPageActions, UserPageActionTypes, UserPageState } from "../UserTypes";
import { Reducer } from "redux";

const initialUserPageState: UserPageState = {
  loading: false,
  username: "",
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
        username: action.username,
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