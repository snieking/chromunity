import { CREATE_LOGGED_IN_USER } from "../../users";
import { CREATE_RANDOM_TOPIC } from "../../topics";
import {
  TopicWallActions,
  UpdateTopicsAction,
  UpdateTopicWallFromCacheAction,
  WallActionTypes,
  WallType
} from "../../../src/redux/WallTypes";
import { runSaga } from "redux-saga";
import { loadAllTopics, loadAllTopicsByPopularity, loadOlderAllTopics } from "../../../src/redux/sagas/TopicWallSagas";
import { ChromunityUser, Topic } from "../../../src/types";
import { getANumber } from "../../helper";

describe("Topic wall [ALL] saga tests", () => {
  const pageSize = 2;
  jest.setTimeout(30000);

  let user: ChromunityUser;

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  beforeAll(async () => {
    const channel = "all";
    user = await CREATE_LOGGED_IN_USER();

    await Array.from({ length: pageSize }).forEach(async () => {
      await CREATE_RANDOM_TOPIC(user, channel);
    });

    await sleep(5000);
  });

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
        removed: false,
        latest_poster: ""
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

  beforeEach(async () => {
    user = await CREATE_LOGGED_IN_USER();
  });

  it("load all topics wall", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, { wallType: WallType.ALL, all: { topics: [], updated: 0 } });

    await runSaga(fakeStore, loadAllTopics, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      pageSize: pageSize,
      ignoreCache: false
    }).toPromise();
    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics wall | returns less than page size", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, { wallType: WallType.NONE, all: { topics: [], updated: 0 } });

    await runSaga(fakeStore, loadAllTopics, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      pageSize: 1000,
      ignoreCache: false
    }).toPromise();
    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics wall | topic already loaded", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.ALL,
      all: { topics: createFakeTopics(0), updated: 0, couldExistOlder: true }
    });

    await runSaga(fakeStore, loadAllTopics, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      pageSize: pageSize,
      ignoreCache: false
    }).toPromise();
    const updateTopicsAction: UpdateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics wall | from cache", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: createFakeTopics(Date.now()),
        updated: Date.now()
      }
    });

    await runSaga(fakeStore, loadAllTopics, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      pageSize: pageSize,
      ignoreCache: false
    }).toPromise();

    const action = getUpdateTopicsFromCacheAction(dispatchedActions);
    expect(action.wallType).toBe(WallType.ALL);
  });

  it("load older all topics", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: createFakeTopics(Date.now()),
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadOlderAllTopics, {
      type: WallActionTypes.LOAD_OLDER_ALL_TOPICS,
      pageSize: pageSize
    }).toPromise();
    const updateTopicsAction: UpdateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load older all topics | no older exists", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: createFakeTopics(0),
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadOlderAllTopics, {
      type: WallActionTypes.LOAD_OLDER_ALL_TOPICS,
      pageSize: pageSize
    }).toPromise();
    const updateTopicsAction: UpdateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(1);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load older all topics | no previous topics loaded", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: [],
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadOlderAllTopics, {
      type: WallActionTypes.LOAD_OLDER_ALL_TOPICS,
      pageSize: pageSize
    }).toPromise();
    const updateTopicsAction: UpdateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics by popularity", async () => {
    const dispatchedActions: TopicWallActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: [],
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadAllTopicsByPopularity, {
      type: WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY,
      timestamp: 0,
      pageSize: pageSize
    }).toPromise();

    const updateTopicsAction: UpdateTopicsAction = getUpdateTopicAction(dispatchedActions);
    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.NONE);
  });
});
