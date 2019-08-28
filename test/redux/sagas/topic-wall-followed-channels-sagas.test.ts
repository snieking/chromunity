import {
  TopicWallActions,
  UpdateTopicsAction,
  UpdateTopicWallFromCacheAction,
  WallActionTypes,
  WallType
} from "../../../src/redux/WallTypes";
import { ChromunityUser, Topic } from "../../../src/types";
import { CREATE_LOGGED_IN_USER } from "../../users";
import { CREATE_RANDOM_TOPIC } from "../../topics";
import { runSaga } from "redux-saga";
import {
  loadFollowedChannelsTopics,
  loadFollowedChannelsTopicsByPopularity,
  loadOlderFollowedChannelsTopics
} from "../../../src/redux/sagas/TopicWallSagas";
import { followChannel } from "../../../src/blockchain/ChannelService";
import { getANumber } from "../../helper";

describe("Topic wall [FOLLOWED CHANNELS] saga tests", () => {
  const testPrefix = "load followed channels topics wall";
  const pageSize = 2;

  let user: ChromunityUser;

  jest.setTimeout(30000);

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const createFakeStore = (dispatchedActions: TopicWallActions[], state: any) => {
    return {
      dispatch: (action: TopicWallActions) => dispatchedActions.push(action),
      getState: () => ({ topicWall: state })
    };
  };

  const getUpdateTopicAction = (dispatchedActions: TopicWallActions[]): UpdateTopicsAction => {
    expect(dispatchedActions.length).toBe(1);
    const action = dispatchedActions[0];
    expect(action.type).toBe(WallActionTypes.UPDATE_TOPICS_WALL);
    return action as UpdateTopicsAction;
  };

  const createFakeTopics = (timestamp: number): Topic[] => {
    return [
      {
        id: "id-" + getANumber(),
        author: "author",
        title: "title",
        message: "message",
        timestamp: timestamp,
        last_modified: timestamp,
        removed: false
      }
    ];
  };

  const getUpdateTopicsFromCacheAction = (dispatchedActions: TopicWallActions[]): UpdateTopicWallFromCacheAction => {
    console.log("Actions: ", dispatchedActions);
    expect(dispatchedActions.length).toBe(1);
    const action = dispatchedActions[0];
    expect(action.type).toBe(WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE);
    return action as UpdateTopicWallFromCacheAction;
  };

  beforeAll(async () => {
    const channel = "AnotherTestChannel";
    user = await CREATE_LOGGED_IN_USER();

    await Array.from({ length: pageSize }).forEach(async () => {
      await CREATE_RANDOM_TOPIC(user, channel);
    });

    await followChannel(user, channel);
    await sleep(5000);
  });

  it(testPrefix, async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedChannels: {
        updated: 0,
        topics: []
      }
    });

    await runSaga(fakeStore, loadFollowedChannelsTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL,
      username: user.name,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.CHANNEL);
  });

  it(testPrefix + " | returns less than page size", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedChannels: {
        updated: 0,
        topics: []
      }
    });

    await runSaga(fakeStore, loadFollowedChannelsTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL,
      username: user.name,
      pageSize: 1000
    }).toPromise();

    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBeLessThan(1000);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.CHANNEL);
  });

  it(testPrefix + " | older loaded", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.CHANNEL,
      followedChannels: {
        topics: createFakeTopics(0),
        updated: 0
      }
    });

    await runSaga(fakeStore, loadFollowedChannelsTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL,
      username: user.name,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.CHANNEL);
  });

  it(testPrefix + " | load older", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.CHANNEL,
      followedChannels: {
        topics: createFakeTopics(Date.now()),
        updated: 0
      }
    });

    await runSaga(fakeStore, loadOlderFollowedChannelsTopics, {
      type: WallActionTypes.LOAD_OLDER_FOLLOWED_CHANNELS_TOPICS,
      username: user.name,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.CHANNEL);
  });

  it(testPrefix + " | from cache", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.CHANNEL,
      followedChannels: {
        topics: createFakeTopics(Date.now()),
        updated: Date.now()
      }
    });

    await runSaga(fakeStore, loadFollowedChannelsTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPIC_WALL,
      username: user.name,
      pageSize: pageSize
    }).toPromise();

    const action = getUpdateTopicsFromCacheAction(dispatchedActions);
    expect(action.wallType).toBe(WallType.CHANNEL);
  });

  it(testPrefix + " | by popularity", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedChannels: {
        updated: 0,
        topics: []
      }
    });

    await runSaga(fakeStore, loadFollowedChannelsTopicsByPopularity, {
      type: WallActionTypes.LOAD_FOLLOWED_CHANNELS_TOPICS_BY_POPULARITY,
      username: user.name,
      timestamp: 0,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.NONE);
  });
});
