import { ChromunityUser, Topic } from '../../types';
import {
  countChannelFollowers,
  followChannel,
  getFollowedChannels,
  getTopicChannelBelongings,
  getTrendingChannels,
  unfollowChannel,
} from './channel-service';
import {
  countTopicsInChannel,
  createTopic,
  getTopicsByChannelAfterTimestamp,
  getTopicsByChannelPriorToTimestamp,
  getTopicsFromFollowedChannelsPriorToTimestamp,
} from './topic-service';
import { createLoggedInUser } from '../../shared/test-utility/users';

jest.setTimeout(60000);

describe('channel tests', () => {
  let loggedInUser: ChromunityUser;

  beforeAll(async (done) => {
    loggedInUser = await createLoggedInUser();
    done();
  });

  it('retrieve topics by channels queries', async () => {
    const title = 'Chromia';
    const channel = 'welcome_home';

    const timestampPriorToCreation: number = Date.now();
    await createTopic(loggedInUser, channel, title, 'Hello chromia');

    let topics: Topic[] = await getTopicsByChannelAfterTimestamp(channel, timestampPriorToCreation - 10000);
    expect(topics.length).toBeGreaterThanOrEqual(1);
    const topic: Topic = topics[0];

    const belongings: string[] = await getTopicChannelBelongings(topic.id);
    expect(belongings.length).toBe(1);

    const countOfTopics = await countTopicsInChannel(channel);
    expect(countOfTopics).toBeGreaterThanOrEqual(1);

    topics = await getTopicsByChannelPriorToTimestamp(channel, Date.now() + 3000, 10);
    expect(topics.length).toBeGreaterThanOrEqual(1);

    const trendingChannels: string[] = await getTrendingChannels(1);
    expect(trendingChannels.length).toBeGreaterThanOrEqual(1);

    await followChannel(loggedInUser, channel);
    let topicsWithFollowedChannel: Topic[] = await getTopicsFromFollowedChannelsPriorToTimestamp(
      loggedInUser.name,
      Date.now() + 3000,
      10
    );
    let followedChannels: string[] = await getFollowedChannels(loggedInUser.name);
    expect(topicsWithFollowedChannel.length).toBeGreaterThanOrEqual(1);
    expect(followedChannels.length).toBe(1);

    const countOfFollowers = await countChannelFollowers(channel);
    expect(countOfFollowers).toBeGreaterThanOrEqual(1);

    await unfollowChannel(loggedInUser, channel);
    topicsWithFollowedChannel = await getTopicsFromFollowedChannelsPriorToTimestamp(
      loggedInUser.name,
      Date.now() + 3000,
      10
    );
    followedChannels = await getFollowedChannels(loggedInUser.name);
    expect(topicsWithFollowedChannel.length).toBe(0);
    expect(followedChannels.length).toBe(0);
  });
});
