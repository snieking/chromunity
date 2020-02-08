import {
  TopicWallActions,
  UpdateTopicsAction,
  UpdateTopicWallFromCacheAction,
  WallActionTypes,
  WallType
} from "../../../src/components/walls/redux/wallTypes";
import { ChromunityUser, Topic } from "../../../src/types";
import { CREATE_LOGGED_IN_USER } from "../../users";
import { CREATE_RANDOM_TOPIC } from "../../topics";
import { createFollowing } from "../../../src/blockchain/FollowingService";
import { runSaga } from "redux-saga";
import {
  loadFollowedUsersTopics,
  loadFollowedUsersTopicsByPopularity,
  loadOlderFollowedUsersTopics
} from "../../../src/components/walls/redux/wallSagas";
import { getANumber } from "../../helper";
import logger from "../../../src/util/logger";

describe("Topic wall [FOLLOWED USERS] saga tests", () => {
  const testPrefix = "load followed users topics wall";
  const pageSize = 2;

  let user: ChromunityUser;
  let secondUser: ChromunityUser;

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

  const getUpdateTopicsAction = (dispatchedActions: TopicWallActions[]): UpdateTopicsAction => {
    logger.debug("Actions: ", dispatchedActions);
    expect(dispatchedActions.length).toBe(1);
    const action = dispatchedActions[0];
    expect(action.type).toBe(WallActionTypes.UPDATE_TOPICS_WALL);
    return action as UpdateTopicsAction;
  };

  const getUpdateTopicsFromCacheAction = (dispatchedActions: TopicWallActions[]): UpdateTopicWallFromCacheAction => {
    logger.debug("Actions: ", dispatchedActions);
    expect(dispatchedActions.length).toBe(1);
    const action = dispatchedActions[0];
    expect(action.type).toBe(WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE);
    return action as UpdateTopicWallFromCacheAction;
  };

  const createFakeTopics = (timestamp: number): Topic[] => {
    return [
      {
        id: "id-" + getANumber(),
        author: "author",
        title: "title",
        overridden_original_title: "",
        message: "message",
        overridden_original_message: "",
        timestamp: timestamp,
        last_modified: timestamp,
        removed: false,
        latest_poster: "author"
      }
    ];
  };

  beforeAll(async () => {
    user = await CREATE_LOGGED_IN_USER();
    secondUser = await CREATE_LOGGED_IN_USER();

    await Array.from({ length: pageSize }).forEach(async () => {
      await CREATE_RANDOM_TOPIC(user, "TestChannel");
    });

    await createFollowing(secondUser, user.name);
    await sleep(5000);
  });

  it(testPrefix, async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: []
      }
    });

    await runSaga(fakeStore, loadFollowedUsersTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      username: secondUser.name,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(testPrefix + " | returns less than page size", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: []
      }
    });

    await runSaga(fakeStore, loadFollowedUsersTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      username: secondUser.name,
      pageSize: 1000
    }).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(2);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(testPrefix + " | older loaded", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.USER,
      followedUsers: { topics: createFakeTopics(0), updated: 0, couldExistOlder: true }
    });

    await runSaga(fakeStore, loadFollowedUsersTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      username: secondUser.name,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(3);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(testPrefix + " | from cache", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.USER,
      followedUsers: {
        topics: createFakeTopics(Date.now()),
        updated: Date.now()
      }
    });

    await runSaga(fakeStore, loadFollowedUsersTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      username: secondUser.name,
      pageSize: pageSize
    }).toPromise();

    const action = getUpdateTopicsFromCacheAction(dispatchedActions);
    expect(action.wallType).toBe(WallType.USER);
  });

  it(testPrefix + " | load older", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.USER,
      followedUsers: {
        topics: createFakeTopics(Date.now()),
        updated: 0
      }
    });

    await runSaga(fakeStore, loadOlderFollowedUsersTopics, {
      type: WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS,
      username: secondUser.name,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(testPrefix + " | by popularity", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: []
      }
    });

    await runSaga(fakeStore, loadFollowedUsersTopicsByPopularity, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY,
      username: secondUser.name,
      timestamp: 0,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.NONE);
  });

  it(testPrefix + " | no followed users", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: []
      }
    });

    const localUser = await CREATE_LOGGED_IN_USER();

    await runSaga(fakeStore, loadFollowedUsersTopics, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      username: localUser.name,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(0);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

});
