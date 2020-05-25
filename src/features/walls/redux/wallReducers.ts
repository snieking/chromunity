import {
  TopicWallActions,
  TopicWallState,
  UpdateTopicsAction,
  UpdateTopicWallFromCacheAction,
  WallActionTypes,
  WallType
} from "./wallTypes";
import { Reducer } from "redux";

const initialTopicWallState: TopicWallState = {
  topics: [],
  couldExistOlder: false,
  all: {
    topics: [],
    updated: 0,
    couldExistOlder: false
  },
  followedChannels: {
    topics: [],
    updated: 0,
    couldExistOlder: false
  },
  followedUsers: {
    topics: [],
    updated: 0,
    couldExistOlder: false
  }
};

export const topicWallReducer: Reducer<TopicWallState, TopicWallActions> = (state = initialTopicWallState, action) => {
  switch (action.type) {
    case WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE: {
      return updateTopicsWallFromCache(state, action);
    }
    case WallActionTypes.UPDATE_TOPICS_WALL: {
      return updateTopicsWall(state, action);
    }
    case WallActionTypes.CLEAR_TOPICS_CACHE: {
      return {
        ...state,
        followedUsers: {
          topics: [],
          updated: 0,
          couldExistOlder: false
        },
        followedChannels: {
          topics: [],
          updated: 0,
          couldExistOlder: false
        }
      }
    }
    default: {
      return state;
    }
  }
};

const updateTopicsWall = (state: TopicWallState, action: UpdateTopicsAction): TopicWallState => {
  switch (action.wallType) {
    case WallType.ALL: {
      return updateTopicsWallAll(state, action);
    }
    case WallType.CHANNEL: {
      return updateTopicsWallFollowedChannels(state, action);
    }
    case WallType.USER: {
      return updateTopicsWallFollowedUsers(state, action);
    }
    default: {
      return {
        ...state,
        topics: action.topics,
        couldExistOlder: action.couldExistOlder
      };
    }
  }
};

const updateTopicsWallAll = (state: TopicWallState, action: UpdateTopicsAction) => {
  return {
    ...state,
    topics: action.topics,
    loading: false,
    couldExistOlder: action.couldExistOlder,
    wallType: action.wallType,
    all: {
      topics: action.topics,
      updated: Date.now(),
      couldExistOlder: action.couldExistOlder
    }
  };
};

const updateTopicsWallFollowedUsers = (state: TopicWallState, action: UpdateTopicsAction) => {
  return {
    ...state,
    topics: action.topics,
    loading: false,
    couldExistOlder: action.couldExistOlder,
    wallType: action.wallType,
    followedUsers: {
      topics: action.topics,
      updated: Date.now(),
      couldExistOlder: action.couldExistOlder
    }
  };
};

const updateTopicsWallFollowedChannels = (state: TopicWallState, action: UpdateTopicsAction) => {
  return {
    ...state,
    topics: action.topics,
    loading: false,
    couldExistOlder: action.couldExistOlder,
    wallType: action.wallType,
    followedChannels: {
      topics: action.topics,
      updated: Date.now(),
      couldExistOlder: action.couldExistOlder
    }
  };
};

const updateTopicsWallFromCache = (state: TopicWallState, action: UpdateTopicWallFromCacheAction): TopicWallState => {
  switch (action.wallType) {
    case WallType.ALL: {
      return updateTopicsWallAllFromCache(state, action);
    }
    case WallType.CHANNEL: {
      return updateTopicsWallFollowedChannelsFromCache(state, action);
    }
    case WallType.USER: {
      return updateTopicsWallFollowedUsersFromCache(state, action);
    }
    default: {
      return state;
    }
  }
};

const updateTopicsWallAllFromCache = (state: TopicWallState, action: UpdateTopicWallFromCacheAction) => {
  return {
    ...state,
    topics: state.all.topics,
    loading: false,
    wallType: action.wallType,
    couldExistOlder: state.all.couldExistOlder
  };
};

const updateTopicsWallFollowedChannelsFromCache = (state: TopicWallState, action: UpdateTopicWallFromCacheAction) => {
  return {
    ...state,
    topics: state.followedChannels.topics,
    loading: false,
    wallType: action.wallType,
    couldExistOlder: state.followedChannels.couldExistOlder
  };
};

const updateTopicsWallFollowedUsersFromCache = (state: TopicWallState, action: UpdateTopicWallFromCacheAction) => {
  return {
    ...state,
    topics: state.followedUsers.topics,
    loading: false,
    wallType: action.wallType,
    couldExistOlder: state.followedUsers.couldExistOlder
  };
};
