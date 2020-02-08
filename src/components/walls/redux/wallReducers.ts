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
  loading: false,
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
    case WallActionTypes.LOAD_ALL_TOPIC_WALL:
    case WallActionTypes.LOAD_OLDER_ALL_TOPICS:
    case WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY:
    case WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL:
    case WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS:
    case WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY:
    case WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL:
    case WallActionTypes.LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS:
    case WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY: {
      return setLoadingFinished(state);
    }
    default: {
      return state;
    }
  }
};

const setLoadingFinished = (state: TopicWallState): TopicWallState => {
  return {
    ...state,
    loading: true
  };
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
        couldExistOlder: action.couldExistOlder,
        loading: false
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
