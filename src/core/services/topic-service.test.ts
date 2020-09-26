import { ChromunityUser, Topic, TopicReply } from '../../types';
import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser,
  createTopic,
  createTopicReply,
  createTopicSubReply,
  deleteTopic,
  getReplyStarRaters,
  getTopicById,
  getTopicRepliesByUserPriorToTimestamp,
  getTopicRepliesPriorToTimestamp,
  getTopicsAfterTimestamp,
  getTopicsByUserPriorToTimestamp,
  getTopicsPriorToTimestamp,
  getTopicStarRaters,
  getTopicSubReplies,
  getTopicSubscribers,
  giveReplyStarRating,
  giveTopicStarRating,
  modifyReply,
  modifyTopic,
  removeReplyStarRating,
  removeTopicStarRating,
  subscribeToTopic,
  unsubscribeFromTopic,
} from './topic-service';
import { createLoggedInUser } from '../../shared/test-utility/users';
import { createRandomTopic } from '../../shared/test-utility/topics';

jest.setTimeout(60000);

describe('topic tests', () => {
  const channel = 'TopicTesting';

  let userLoggedIn: ChromunityUser;
  let secondLoggedInUser: ChromunityUser;
  let topic: Topic;

  beforeAll(async () => {
    userLoggedIn = await createLoggedInUser();
    secondLoggedInUser = await createLoggedInUser();
    await createTopic(userLoggedIn, channel, 'Second topic', 'Not as good as the first one... #superior');
    const topics: Topic[] = await getTopicsByUserPriorToTimestamp(userLoggedIn.name, Date.now(), 10);
    expect(topics.length).toBeGreaterThanOrEqual(1);
    topic = topics[0];
  });

  it('create topic', async () => {
    const user = await createLoggedInUser();
    const user2 = await createLoggedInUser();

    await createTopic(user, channel, 'First topic', 'Sweet topic you got there!');
    await createTopic(user2, channel, 'Second topic', 'Not as good as the first one... #superior');
    const topics: Topic[] = await getTopicsByUserPriorToTimestamp(user.name, Date.now(), 10);
    expect(topics.length).toBeGreaterThanOrEqual(1);
  });

  it('create many topics', async () => {
    await Array.from({ length: 50 }).forEach(async () => {
      const user = await createLoggedInUser();
      await createRandomTopic(user, 'general');
    });
  });

  it('reply to topic and reply to a reply', async () => {
    const user = await createLoggedInUser();
    const user2 = await createLoggedInUser();

    await createTopicReply(user, topic.id, 'I completely agree!');

    const replies: TopicReply[] = await getTopicRepliesPriorToTimestamp(topic.id, Date.now(), 10);
    expect(replies.length).toBe(1);
    const reply: TopicReply = replies[0];

    await giveReplyStarRating(user2, reply.id);
    const upvotedBy: string[] = await getReplyStarRaters(reply.id);
    expect(upvotedBy.length).toBe(1);

    const replyStars: number = await countReplyStarRatingForUser(user.name);
    expect(replyStars).toBeGreaterThanOrEqual(1);

    await removeReplyStarRating(user2, reply.id);
    const upvotedBy2: string[] = await getReplyStarRaters(reply.id);
    expect(upvotedBy2.length).toBe(0);

    await createTopicSubReply(user2, topic.id, reply.id, 'Are you certain?', userLoggedIn.name);
    const subReplies: TopicReply[] = await getTopicSubReplies(reply.id);
    expect(subReplies.length).toBe(1);

    const subReply: TopicReply = subReplies[0];
    await createTopicSubReply(user2, topic.id, subReply.id, 'I am always certain', secondLoggedInUser.name);

    const subSubReplies: TopicReply[] = await getTopicSubReplies(subReply.id);
    expect(subSubReplies.length).toBe(1);
  });

  it('reply to topic and update reply', async () => {
    const user = await createLoggedInUser();
    await createTopicReply(user, topic.id, 'This message should be modified!');
    const replies: TopicReply[] = await getTopicRepliesPriorToTimestamp(topic.id, Date.now(), 10);
    expect(replies.length).toBeGreaterThanOrEqual(1);
    const reply: TopicReply = replies[0];

    await modifyReply(user, reply.id, 'This post has been modified');
  });

  it('star rate topic', async () => {
    const user = await createLoggedInUser();
    await giveTopicStarRating(user, topic.id);

    let usersWhoRated: string[] = await getTopicStarRaters(topic.id);
    expect(usersWhoRated.length).toBe(1);

    const topicStars: number = await countTopicStarRatingForUser(topic.author);
    expect(topicStars).toBeGreaterThanOrEqual(1);

    await removeTopicStarRating(user, topic.id);
    usersWhoRated = await getTopicStarRaters(topic.id);
    expect(usersWhoRated.length).toBe(0);
  });

  it('star rate topic again', async () => {
    const user = await createLoggedInUser();
    await giveTopicStarRating(user, topic.id);
    const usersWhoRated: string[] = await getTopicStarRaters(topic.id);
    expect(usersWhoRated.length).toBe(1);
  });

  it('topic subscription', async () => {
    await subscribeToTopic(secondLoggedInUser, topic.id);
    let subscribers: string[] = await getTopicSubscribers(topic.id);
    expect(subscribers.length).toBe(2);

    await unsubscribeFromTopic(secondLoggedInUser, topic.id);
    subscribers = await getTopicSubscribers(topic.id);
    expect(subscribers.length).toBe(1);
  });

  it('get topic after timestamp', async () => {
    const user = await createLoggedInUser();
    const title = 'It is fun to program in Rell';
    const message = 'It is fun to program in #Rell. It is a great language to interact with a #blockchain.';
    await createTopic(user, channel, title, message);
    const topics: Topic[] = await getTopicsAfterTimestamp(Date.now() - 30000, 10);
    expect(topics.length).toBeGreaterThan(0);
  });

  it('get topic prior to timestamp', async () => {
    const user = await createLoggedInUser();
    const title = 'Blockchain has never been easier';
    const message = 'This is a fact.';
    await createTopic(user, channel, title, message);
    const topics: Topic[] = await getTopicsPriorToTimestamp(Date.now(), 10);
    expect(topics.length).toBeGreaterThan(0);
  });

  it('get topic by id', async () => {
    const fetchedTopic: Topic = await getTopicById(topic.id);
    expect(topic.message).toBe(fetchedTopic.message);
  });

  it('get replies by user', async () => {
    const user = await createLoggedInUser();
    await createTopicReply(user, topic.id, 'Hello!');

    const replies: TopicReply[] = await getTopicRepliesByUserPriorToTimestamp(user.name, Date.now(), 10);
    expect(replies.length).toBeGreaterThanOrEqual(1);
  });

  it('create and mofiy topic', async () => {
    const user = await createLoggedInUser();
    const title = 'Rell Assistance';
    const message = 'Post your rell questions here to receive help from the community.';
    await createTopic(user, 'rell', title, message);
    const topics: Topic[] = await getTopicsByUserPriorToTimestamp(user.name, Date.now(), 10);
    expect(topics.length).toBeGreaterThan(0);

    await modifyTopic(user, topics[0].id, 'Post your rell questions here to receive help from the awesome community.');
  });

  it('create and delete topic', async () => {
    const user = await createLoggedInUser();
    const text = 'To be deleted';

    await createTopic(user, 'test', text, text);

    let topics: Topic[] = await getTopicsByUserPriorToTimestamp(user.name, Date.now(), 10);
    expect(topics.length).toBe(1);

    const theTopic: Topic = topics[0];
    await deleteTopic(user, theTopic.id);

    topics = await getTopicsByUserPriorToTimestamp(user.name, Date.now(), 10);
    expect(topics.length).toBe(0);
  });

  it('count posts', async () => {
    const user = await createLoggedInUser();
    const user2 = await createLoggedInUser();

    await createTopic(user, 'rell', 'Why Rell?', 'Could someone clarify for me some benefits of using Rell?');
    const topics: Topic[] = await getTopicsByUserPriorToTimestamp(user.name, Date.now(), 10);
    expect(topics.length).toBeGreaterThan(0);

    await createTopicReply(
      user2,
      topics[0].id,
      'Rell is very developer friendly as it a language which is very familiar to SQL.'
    );

    const countOfTopics: number = await countTopicsByUser(user.name);
    const countOfReplies: number = await countRepliesByUser(user2.name);

    expect(countOfTopics).toBeGreaterThan(0);
    expect(countOfReplies).toBeGreaterThan(0);
  });
});
