import * as bip39 from "bip39";
import { CREATE_LOGGED_IN_USER } from "../../../shared/test-utility/users";
import { ChromunityUser, Topic } from "../../../types";
import { CREATE_RANDOM_TOPIC } from "../../../shared/test-utility/topics";
import { getANumber } from "../../../shared/test-utility/helper";
import { ChannelActions, ChannelActionTypes, UpdateChannelAction } from "./channelTypes";
import { runSaga } from "redux-saga";
import { loadChannel, loadChannelByPopularity, loadOlderTopicsInChannel } from "./channelSagas";


describe("Channel saga tests", () => {

  const pageSize = 2;
  const testPrefix = "load channel";

  let channel: string;

  const createFakeStore = (dispatchedActions: ChannelActions[], state: any) => {
    return {
      dispatch: (action: ChannelActions) => dispatchedActions.push(action),
      getState: () => ({ channel: state })
    };
  };

  const getUpdateChannelAction = (dispatchedActions: ChannelActions[]): UpdateChannelAction => {
    expect(dispatchedActions.length).toBe(1);
    const action = dispatchedActions[0];
    expect(action.type).toBe(ChannelActionTypes.UPDATE_CHANNEL);
    return action as UpdateChannelAction;
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
        latest_poster: "author",
        moderated_by: []
      }
    ];
  };

  beforeEach(async () => {
    channel = bip39.generateMnemonic(128).split(" ")[0];
    const user: ChromunityUser = await CREATE_LOGGED_IN_USER();
    await CREATE_RANDOM_TOPIC(user, channel);
    await CREATE_RANDOM_TOPIC(user, channel);
  });

  jest.setTimeout(30000);

  it(testPrefix, async () => {
    const dispatchedActions: ChannelActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: []
    });

    await runSaga(fakeStore, loadChannel, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      name: channel,
      pageSize: pageSize
    }).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(pageSize);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(testPrefix + " | no more exists", async () => {
    const dispatchedActions: ChannelActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: []
    });

    await runSaga(fakeStore, loadChannel, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      name: channel,
      pageSize: 1000
    }).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(2);
    expect(action.couldExistOlder).toBe(false);
    expect(action.name).toBe(channel);
  });

  it(testPrefix + " | load more recent", async () => {
    const dispatchedActions: ChannelActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(0),
      name: channel
    });

    await runSaga(fakeStore, loadChannel, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      name: channel,
      pageSize: pageSize
    }).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBeGreaterThanOrEqual(pageSize + 1);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(testPrefix + " | load different channel", async () => {
    const dispatchedActions: ChannelActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(0),
      name: "anotherChannel"
    });

    await runSaga(fakeStore, loadChannel, {
      type: ChannelActionTypes.LOAD_CHANNEL,
      name: channel,
      pageSize: pageSize
    }).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(pageSize);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(testPrefix + " | load older", async () => {
    const dispatchedActions: ChannelActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(Date.now()),
      name: channel
    });

    await runSaga(fakeStore, loadOlderTopicsInChannel, {
      type: ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS,
      pageSize: pageSize
    }).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(pageSize + 1);
    expect(action.couldExistOlder).toBe(true);
    expect(action.name).toBe(channel);
  });

  it(testPrefix + " | load older and no more exists", async () => {
    const dispatchedActions: ChannelActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      topics: createFakeTopics(Date.now()),
      name: channel
    });

    await runSaga(fakeStore, loadOlderTopicsInChannel, {
      type: ChannelActionTypes.LOAD_OLDER_CHANNEL_TOPICS,
      pageSize: 1000
    }).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBeGreaterThanOrEqual(3);
    expect(action.couldExistOlder).toBe(false);
    expect(action.name).toBe(channel);
  });

  it(testPrefix + " | by popularity", async () => {
    const dispatchedActions: ChannelActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      name: channel
    });

    await runSaga(fakeStore, loadChannelByPopularity, {
      type: ChannelActionTypes.LOAD_CHANNEL_POPULARITY,
      name: channel,
      timestamp: 0,
      pageSize: pageSize
    }).toPromise();

    const action = getUpdateChannelAction(dispatchedActions);

    expect(action.topics.length).toBe(pageSize);
    expect(action.couldExistOlder).toBe(false);
    expect(action.name).toBe("");
  });

});