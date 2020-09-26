/* eslint-disable no-restricted-syntax */
import * as bip39 from 'bip39';
import { runSaga } from 'redux-saga';
import { expectSaga } from 'redux-saga-test-plan';
import { Action } from '@reduxjs/toolkit';
import { createLoggedInUser } from '../../../shared/test-utility/users';
import { ChromunityUser, Topic } from '../../../types';
import { createRandomTopic } from '../../../shared/test-utility/topics';
import { getANumber } from '../../../shared/test-utility/helper';
import { ChannelActionTypes, IUpdateChannel } from './channel-types';
import { loadChannelSaga, loadOlderTopicsInChannelSaga } from './channel-sagas';

describe('Channel saga tests', () => {
  const pageSize = 2;
  const testPrefix = 'load channel';

  let channel: string;

  const createFakeStore = (dispatchedActions: any[], state: any) => {
    return {
      dispatch: (action: any) => dispatchedActions.push(action),
      getState: () => ({ channel: state }),
    };
  };

  const getUpdateChannelAction = (dispatchedActions: any[]): IUpdateChannel => {
    for (const action of dispatchedActions) {
      if (action.type === ChannelActionTypes.UPDATE_CHANNEL) return action.payload;
    }
    return null;
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

  beforeEach(async (done) => {
    channel = bip39.generateMnemonic(128).split(' ')[0];
    const user: ChromunityUser = await createLoggedInUser();
    await createRandomTopic(user, channel);
    await createRandomTopic(user, channel);
    done();
  });

  jest.setTimeout(30000);

  it(testPrefix, async () => {
    return expectSaga(loadChannelSaga, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      payload: { name: channel, pageSize },
    } as Action).put({
      type: ChannelActionTypes.UPDATE_CHANNEL,
      payload: {},
    });
  });

  it(testPrefix, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: [],
    });

    await runSaga(fakeStore, loadChannelSaga, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      payload: {
        name: channel,
        pageSize,
      },
    } as Action).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(pageSize);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(`${testPrefix} | no more exists`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: [],
    });

    await runSaga(fakeStore, loadChannelSaga, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      payload: {
        name: channel,
        pageSize: 1000,
      },
    } as Action).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(2);
    expect(action.couldExistOlder).toBe(false);
    expect(action.name).toBe(channel);
  });

  it(`${testPrefix} | load more recent`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(0),
      name: channel,
    });

    await runSaga(fakeStore, loadChannelSaga, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      payload: {
        name: channel,
        pageSize,
      },
    } as Action).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBeGreaterThanOrEqual(pageSize + 1);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(`${testPrefix} | load different channel`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(0),
      name: 'anotherChannel',
    });

    await runSaga(fakeStore, loadChannelSaga, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      payload: {
        name: channel,
        pageSize,
      },
    } as Action).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(pageSize);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(`${testPrefix} | load older`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(Date.now()),
      name: channel,
    });

    await runSaga(fakeStore, loadOlderTopicsInChannelSaga, {
      type: ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS,
      payload: pageSize,
    } as Action).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(pageSize + 1);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(`${testPrefix} | load older and no more exists`, async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(Date.now()),
      name: channel,
    });

    await runSaga(fakeStore, loadOlderTopicsInChannelSaga, {
      type: ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS,
      payload: 1000,
    } as Action).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBeGreaterThanOrEqual(3);
    expect(action.couldExistOlder).toBe(false);
    expect(action.name).toBe(channel);
  });
});
