import { ChromunityUser, Topic, TopicReply } from "../../../types";
import { CREATE_LOGGED_IN_USER } from "../../../shared/test-utility/users";
import { CREATE_RANDOM_TOPIC } from "../../../shared/test-utility/topics";
import { createTopicReply, getTopicsByUserPriorToTimestamp } from "../../../core/services/topic-service";
import {
  UserPageActionTypes, IUpdateUserTopics, IUpdateUserReplies,
} from "./user-types";
import { loadUserTopicsSaga, loadUserRepliesSaga, loadUserFollowedChannelsSaga } from "./user-page-sagas";
import { runSaga } from "redux-saga";
import { getANumber } from "../../../shared/test-utility/helper";
import { followChannel } from "../../../core/services/channel-service";
import { Action } from "@reduxjs/toolkit";

describe("User page saga tests", () => {
  const topicsTitle = "load user topics";
  const repliesTitle = "load user replies";
  const channelsTitle = "load user channels";

  const pageSize = 25;
  const channel = "";

  const emptyTopics: Topic[] = [];
  const emptyReplies: TopicReply[] = [];

  jest.setTimeout(30000);

  let user: ChromunityUser;
  let secondUser: ChromunityUser;

  const createFakeStore = (dispatchedActions: any[], state: any) => {
    return {
      dispatch: (action: any) => dispatchedActions.push(action),
      getState: () => ({ userPage: state }),
    };
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
        moderated_by: [],
      },
    ];
  };

  const createFakeReplies = (timestamp: number): TopicReply[] => {
    return [
      {
        id: "id-" + getANumber(),
        topic_id: "id-" + getANumber(),
        author: "author",
        message: "message",
        timestamp: timestamp,
        isSubReply: false,
        moderated_by: [],
      },
    ];
  };

  const getUpdateUserTopicsAction = (actions: any[]): IUpdateUserTopics => {
    for (const action of actions) {
      if (action.type === UserPageActionTypes.UPDATE_USER_TOPICS) return action.payload;
    }
    return null;
  };

  const getUpdateUserRepliesAction = (actions: any[]): IUpdateUserReplies => {
    for (const action of actions) {
      if (action.type === UserPageActionTypes.UPDATE_USER_REPLIES) return action.payload;
    }
    return null;
  };

  const getUpdateUserFollowedChannelsAction = (actions: any[]): string[] => {
    for (const action of actions) {
      if (action.type === UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS) return action.payload;
    }
    return null;
  };

  beforeAll(async () => {
    user = await CREATE_LOGGED_IN_USER();
    secondUser = await CREATE_LOGGED_IN_USER();

    await CREATE_RANDOM_TOPIC(user, channel);
    const topics: Topic[] = await getTopicsByUserPriorToTimestamp(user.name, Date.now(), 1);
    const topic: Topic = topics[0];

    await createTopicReply(secondUser, topic.id, "A test reply..");
    await followChannel(secondUser, channel);
  });

  it(topicsTitle, async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { topics: emptyTopics });

    await runSaga(fakeStore, loadUserTopicsSaga, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      payload: {
        username: user.name,
        pageSize: pageSize
      }
    } as Action).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(1);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(false);
  });

  it(topicsTitle + " | none exists", async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { topics: emptyTopics });

    await runSaga(fakeStore, loadUserTopicsSaga, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      payload: {
        username: secondUser.name,
        pageSize: pageSize
      }
    } as Action).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(0);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(false);
  });

  it(topicsTitle + " | pageSize returned", async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { topics: emptyTopics });

    await runSaga(fakeStore, loadUserTopicsSaga, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      payload: {
        username: user.name,
        pageSize: 1
      }
    } as Action).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(1);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(true);
  });

  it(topicsTitle + " | older already loaded", async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { topics: createFakeTopics(Date.now()) });

    await runSaga(fakeStore, loadUserTopicsSaga, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      payload: {
        username: user.name,
        pageSize: pageSize
      }
    } as Action).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(2);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(false);
  });

  it(repliesTitle, async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { replies: emptyReplies });

    await runSaga(fakeStore, loadUserRepliesSaga, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      payload: {
        username: secondUser.name,
        pageSize: pageSize
      }
    } as Action).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(1);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(false);
  });

  it(repliesTitle + " | none exists", async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { replies: emptyReplies });

    await runSaga(fakeStore, loadUserRepliesSaga, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      payload: {
        username: user.name,
        pageSize: pageSize
      }
    } as Action).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(0);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(false);
  });

  it(repliesTitle + " | pageSize returned", async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { replies: emptyReplies });

    await runSaga(fakeStore, loadUserRepliesSaga, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      payload: {
        username: secondUser.name,
        pageSize: 1
      }
    } as Action).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(1);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(true);
  });

  it(repliesTitle + " | older already loaded", async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, { replies: createFakeReplies(Date.now()) });

    await runSaga(fakeStore, loadUserRepliesSaga, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      payload: {
        username: secondUser.name,
        pageSize: pageSize
      }
    } as Action).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(2);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(false);
  });

  it(channelsTitle, async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, {});

    await runSaga(fakeStore, loadUserFollowedChannelsSaga, {
      type: UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS,
      payload: secondUser.name,
    } as Action).toPromise();

    const updateUserFollowedChannelsAction = getUpdateUserFollowedChannelsAction(actions);

    expect(updateUserFollowedChannelsAction.length).toBe(1);
  });

  it(channelsTitle + " | none returned", async () => {
    const actions: any[] = [];
    const fakeStore = createFakeStore(actions, {});

    await runSaga(fakeStore, loadUserFollowedChannelsSaga, {
      type: UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS,
      payload: user.name,
    } as Action).toPromise();

    const updateUserFollowedChannelsAction = getUpdateUserFollowedChannelsAction(actions);

    expect(updateUserFollowedChannelsAction.length).toBe(0);
  });
});
