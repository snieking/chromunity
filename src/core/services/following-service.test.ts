import { ChromunityUser, Topic } from '../../types';
import {
  amIAFollowerOf,
  countUserFollowers,
  countUserFollowings,
  createFollowing,
  removeFollowing,
} from './following-service';
import {
  createTopic,
  getTopicsByFollowsSortedByPopularityAfterTimestamp,
  getTopicsFromFollowsAfterTimestamp,
  getTopicsFromFollowsPriorToTimestamp,
} from './topic-service';
import { createLoggedInUser } from '../../shared/test-utility/users';

jest.setTimeout(30000);

describe('following tests', () => {
  let loggedInUser: ChromunityUser;
  let loggedInUser2: ChromunityUser;

  beforeAll(async () => {
    loggedInUser = await createLoggedInUser();
    loggedInUser2 = await createLoggedInUser();
  });

  it('user follow another user', async () => {
    await createFollowing(loggedInUser, loggedInUser2.name);
    const followers: number = await countUserFollowers(loggedInUser2.name);
    expect(followers).toBe(1);

    const followings: number = await countUserFollowings(loggedInUser.name);
    expect(followings).toBe(1);

    expect(await amIAFollowerOf(loggedInUser, loggedInUser2.name)).toBe(true);

    const title = 'Message to my followers';
    const message = 'This message is perhaps only of interest to my followers';
    await createTopic(loggedInUser2, 'FollowTests', title, message);

    const followingsTopics: Topic[] = await getTopicsFromFollowsPriorToTimestamp(loggedInUser.name, Date.now(), 10);
    expect(followingsTopics.length).toBe(1);

    const followingsTopics2: Topic[] = await getTopicsFromFollowsAfterTimestamp(
      loggedInUser.name,
      Date.now() - 20000,
      10
    );
    expect(followingsTopics2.length).toBe(1);

    const followingTopics3: Topic[] = await getTopicsByFollowsSortedByPopularityAfterTimestamp(
      loggedInUser.name,
      0,
      10
    );
    expect(followingTopics3.length).toBe(1);

    await removeFollowing(loggedInUser, loggedInUser2.name);
    expect(await amIAFollowerOf(loggedInUser, loggedInUser2.name)).toBe(false);
  });
});
