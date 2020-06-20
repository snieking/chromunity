/* eslint-disable no-restricted-syntax */
import { runSaga } from 'redux-saga';
import { Action } from 'redux';
import { WallActionTypes, WallType, IUpdateTopics } from './wall-types';
import { ChromunityUser, Topic } from '../../../types';
import { createLoggedInUser } from '../../../shared/test-utility/users';
import { createRandomTopic } from '../../../shared/test-utility/topics';
import { createFollowing } from '../../../core/services/following-service';
import {
  loadFollowedUsersTopicsSaga,
  loadFollowedUsersTopicsByPopularitySaga,
  loadOlderFollowedUsersTopicsSaga,
} from './wall-sagas';
import { getANumber } from '../../../shared/test-utility/helper';

describe('Topic wall [FOLLOWED USERS] saga tests', () => {
  const testPrefix = 'load followed users topics wall';
  const pageSize = 2;

  let user: ChromunityUser;
  let secondUser: ChromunityUser;

  jest.setTimeout(30000);

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const createFakeStore = (dispatchedActions: any[], state: any) => {
    return {
      dispatch: (action: Action) => dispatchedActions.push(action),
      getState: () => ({ topicWall: state }),
    };
  };

  const getUpdateTopicsAction = (dispatchedActions: any[]): IUpdateTopics => {
    for (const action of dispatchedActions) {
      if (action.type === WallActionTypes.UPDATE_TOPICS_WALL) return action.payload;
    }
    return null;
  };

  const getUpdateTopicsFromCacheAction = (dispatchedActions: any[]): WallType => {
    for (const action of dispatchedActions) {
      if (action.type === WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE) return action.payload;
    }
  };

  const createFakeTopics = (timestamp: number): Topic[] => {
    return [
      {
        id: `id-${getANumber()}`,
        author: 'author',
        title: 'title',
        message: 'message',
        timestamp,
        last_modified: timestamp,
        latest_poster: 'author',
        moderated_by: [],
      },
    ];
  };

  beforeAll(async () => {
    user = await createLoggedInUser();
    secondUser = await createLoggedInUser();

    await Array.from({ length: pageSize }).forEach(async () => {
      await createRandomTopic(user, 'TestChannel');
    });

    await createFollowing(secondUser, user.name);
    await sleep(5000);
  });

  it(testPrefix, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: [],
      },
    });

    await runSaga(fakeStore, loadFollowedUsersTopicsSaga, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      payload: {
        username: secondUser.name,
        pageSize,
      },
    } as Action).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(`${testPrefix} | returns less than page size`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: [],
      },
    });

    await runSaga(fakeStore, loadFollowedUsersTopicsSaga, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      payload: {
        username: secondUser.name,
        pageSize: 1000,
      },
    } as Action).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(2);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(`${testPrefix} | older loaded`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.USER,
      followedUsers: { topics: createFakeTopics(0), updated: 0, couldExistOlder: true },
    });

    await runSaga(fakeStore, loadFollowedUsersTopicsSaga, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      payload: {
        username: secondUser.name,
        pageSize,
      },
    } as Action).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(3);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(`${testPrefix} | from cache`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.USER,
      followedUsers: {
        topics: createFakeTopics(Date.now()),
        updated: Date.now(),
      },
    });

    await runSaga(fakeStore, loadFollowedUsersTopicsSaga, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      payload: {
        username: secondUser.name,
        pageSize,
      },
    } as Action).toPromise();

    const action = getUpdateTopicsFromCacheAction(dispatchedActions);
    expect(action).toBe(WallType.USER);
  });

  it(`${testPrefix} | load older`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.USER,
      followedUsers: {
        topics: createFakeTopics(Date.now()),
        updated: 0,
      },
    });

    await runSaga(fakeStore, loadOlderFollowedUsersTopicsSaga, {
      type: WallActionTypes.LOAD_OLDER_FOLLOWED_USERS_TOPICS,
      payload: {
        username: secondUser.name,
        pageSize,
      },
    } as Action).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });

  it(`${testPrefix} | by popularity`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: [],
      },
    });

    await runSaga(fakeStore, loadFollowedUsersTopicsByPopularitySaga, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPICS_BY_POPULARITY,
      payload: {
        username: secondUser.name,
        timestamp: 0,
        pageSize,
      },
    } as Action).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.NONE);
  });

  it(`${testPrefix} | no followed users`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      followedUsers: {
        updated: 0,
        topics: [],
      },
    });

    const localUser = await createLoggedInUser();

    await runSaga(fakeStore, loadFollowedUsersTopicsSaga, {
      type: WallActionTypes.LOAD_FOLLOWED_USERS_TOPIC_WALL,
      payload: {
        username: localUser.name,
        pageSize,
      },
    } as Action).toPromise();

    const updateTopicsAction = getUpdateTopicsAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(0);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.USER);
  });
});
