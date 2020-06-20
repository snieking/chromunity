import * as BoomerangCache from 'boomerang-cache';
import { op } from 'ft3-lib';
import { BLOCKCHAIN, executeQuery, executeOperations } from './postchain';
import { toLowerCase, uniqueId } from '../../shared/util/util';
import { Topic, TopicReply, ChromunityUser, PollSpecification, PollData } from '../../types';
import { sendNotifications } from './notification-service';
import { getUsers } from '../../shared/util/text-parsing';
import { topicEvent } from '../../shared/util/matomo';

const topicsCache = BoomerangCache.create('topic-bucket', {
  storage: 'session',
  encrypt: false,
});

const starRatingCache = BoomerangCache.create('rating-bucket', {
  storage: 'session',
  encrypt: false,
});

export const removeTopicIdFromCache = (id: string) => topicsCache.remove(id);

const sendUserMentionNotifications = (user: ChromunityUser, topicId: string, message: string) =>
  sendNotifications(user, `@${user.name} mentioned you in /t/${topicId}`, message, getUsers(message));

export function createTopic(
  user: ChromunityUser,
  channelName: string,
  title: string,
  message: string,
  poll?: PollSpecification
) {
  const topicId = uniqueId();

  const operation = 'create_topic';

  return executeOperations(
    user.ft3User,
    op(
      operation,
      topicId,
      user.ft3User.authDescriptor.id,
      toLowerCase(user.name),
      toLowerCase(channelName),
      channelName,
      title,
      message
    )
  ).then((promise: unknown) => {
    if (poll && poll.question && poll.options.length > 1) {
      executeOperations(
        user.ft3User,
        op('create_poll', topicId, user.ft3User.authDescriptor.id, toLowerCase(user.name), poll.question, poll.options)
      )
        .catch()
        .then();
    }

    subscribeToTopic(user, topicId)
      .catch()
      .then(() => sendUserMentionNotifications(user, topicId, message).catch().then());

    topicEvent('create');
    return promise;
  });
}

export function modifyTopic(user: ChromunityUser, topicId: string, updatedText: string) {
  topicsCache.remove(topicId);
  topicEvent('modify');
  return modifyText(user, topicId, updatedText, 'modify_topic');
}

export function modifyReply(user: ChromunityUser, replyId: string, updatedText: string) {
  topicEvent('modify-reply');
  return modifyText(user, replyId, updatedText, 'modify_reply');
}

export function deleteReply(user: ChromunityUser, replyId: string) {
  const rellOperation = 'delete_reply';

  topicEvent('delete-reply');
  return executeOperations(
    user.ft3User,
    op(rellOperation, replyId, user.ft3User.authDescriptor.id, toLowerCase(user.name))
  );
}

function modifyText(user: ChromunityUser, id: string, updatedText: string, rellOperation: string) {
  return executeOperations(
    user.ft3User,
    op(rellOperation, id, user.ft3User.authDescriptor.id, toLowerCase(user.name), updatedText)
  );
}

export function deleteTopic(user: ChromunityUser, id: string) {
  topicsCache.remove(id);
  const rellOperation = 'delete_topic';

  topicEvent('delete');
  return executeOperations(user.ft3User, op(rellOperation, id, user.ft3User.authDescriptor.id, toLowerCase(user.name)));
}

export function createTopicReply(user: ChromunityUser, topicId: string, message: string) {
  const replyId = uniqueId();

  const rellOperation = 'create_reply';

  return executeOperations(
    user.ft3User,
    op(rellOperation, topicId, user.ft3User.authDescriptor.id, replyId, toLowerCase(user.name), message)
  ).then((promise: unknown) => {
    getTopicSubscribers(topicId)
      .then((users) =>
        createReplyTriggerString(user, topicId, replyId).then((s) =>
          sendNotifications(
            user,
            s,
            message,
            users.map((name) => name.toLocaleLowerCase()).filter((item) => item !== user.name)
          )
            .catch()
            .then()
        )
      )
      .then(() => sendUserMentionNotifications(user, topicId, message).catch().then());

    topicEvent('create-reply');
    return promise;
  });
}

export function createTopicSubReply(
  user: ChromunityUser,
  topicId: string,
  replyId: string,
  message: string,
  replyTo: string
) {
  const subReplyId = uniqueId();

  const operation = 'create_sub_reply';

  return executeOperations(
    user.ft3User,
    op(operation, topicId, user.ft3User.authDescriptor.id, replyId, subReplyId, toLowerCase(user.name), message)
  ).then((promise: unknown) => {
    getTopicSubscribers(topicId)
      .then((users) => {
        if (!users.includes(replyTo.toLocaleLowerCase())) {
          users.push(replyTo);
        }

        createReplyTriggerString(user, topicId, subReplyId).then((s) =>
          sendNotifications(
            user,
            s,
            message,
            users.map((name) => name.toLocaleLowerCase()).filter((item) => item !== user.name)
          )
        );
      })
      .then(() => sendUserMentionNotifications(user, topicId, message).catch().then());

    topicEvent('create-reply');
    topicEvent('create-sub-reply');
    return promise;
  });
}

async function createReplyTriggerString(user: ChromunityUser, id: string, replyId: string): Promise<string> {
  let topic: Topic = topicsCache.get(id);

  if (topic == null) {
    topic = await getTopicById(id, user, true);
  }

  return Promise.resolve(`@${user.name} replied to '${topic.title}' /t/${id}#${replyId}`);
}

export function getTopicRepliesPriorToTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number,
  user?: ChromunityUser
): Promise<TopicReply[]> {
  return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, 'get_topic_replies_prior_to_timestamp', user);
}

export function getTopicRepliesAfterTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number,
  user?: ChromunityUser
): Promise<TopicReply[]> {
  return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, 'get_topic_replies_after_timestamp', user);
}

function getTopicRepliesForTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string,
  user?: ChromunityUser
) {
  return BLOCKCHAIN.then((bc) =>
    bc.query(rellOperation, {
      username: user != null ? toLowerCase(user.name) : '',
      topic_id: topicId,
      timestamp,
      page_size: pageSize,
    })
  );
}

export function getTopicRepliesByUserPriorToTimestamp(
  name: string,
  timestamp: number,
  pageSize: number
): Promise<TopicReply[]> {
  const query = 'get_topic_replies_by_user_prior_to_timestamp';
  return executeQuery(query, { name: toLowerCase(name), timestamp, page_size: pageSize });
}

export function getTopicSubReplies(replyId: string, user?: ChromunityUser): Promise<TopicReply[]> {
  return executeQuery('get_sub_replies', {
    username: user != null ? toLowerCase(user.name) : '',
    parent_reply_id: replyId,
  });
}

export function getTopicsByUserPriorToTimestamp(
  username: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  const query = 'get_topics_by_user_id_prior_to_timestamp';
  return executeQuery(query, { name: toLowerCase(username), timestamp, page_size: pageSize }).then(
    (topics: Topic[]) => {
      topics.forEach((topic) => topicsCache.set(topic.id, topic, 300));
      return topics;
    }
  );
}

export function getTopicsByChannelPriorToTimestamp(
  channelName: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  const query = 'get_topics_by_channel_prior_to_timestamp';

  return executeQuery(query, { name: toLowerCase(channelName), timestamp, page_size: pageSize }).then(
    (topics: Topic[]) => {
      topics.forEach((topic) => topicsCache.set(topic.id, topic, 300));
      return topics;
    }
  );
}

export function getTopicsByChannelAfterTimestamp(channelName: string, timestamp: number): Promise<Topic[]> {
  const query = 'get_topics_by_channel_after_timestamp';
  return executeQuery(query, { name: toLowerCase(channelName), timestamp }).then((topics: Topic[]) => {
    topics.forEach((topic) => topicsCache.set(topic.id, topic, 300));
    return topics;
  });
}

export function countTopicsInChannel(channelName: string): Promise<number> {
  const query = 'count_topics_by_channel';
  return executeQuery(query, { name: toLowerCase(channelName) });
}

export function getTopicStarRaters(topicId: string, clearCache = false): Promise<string[]> {
  if (clearCache) {
    starRatingCache.remove(topicId);
  } else {
    const raters: string[] = starRatingCache.get(topicId);

    if (raters != null) {
      return new Promise<string[]>((resolve) => resolve(raters));
    }
  }

  const query = 'get_star_rating_for_topic';
  return executeQuery(query, { id: topicId }).then((raters: string[]) => {
    starRatingCache.set(topicId, raters, 600);
    return raters;
  });
}

export function giveTopicStarRating(user: ChromunityUser, topicId: string) {
  topicEvent('add-star');
  return modifyRatingAndSubscription(user, topicId, 'give_topic_star_rating');
}

export function removeTopicStarRating(user: ChromunityUser, topicId: string) {
  topicEvent('remove-star');
  return modifyRatingAndSubscription(user, topicId, 'remove_topic_star_rating');
}

export function giveReplyStarRating(user: ChromunityUser, replyId: string) {
  topicEvent('add-reply-star');
  return modifyRatingAndSubscription(user, replyId, 'give_reply_star_rating');
}

export function removeReplyStarRating(user: ChromunityUser, replyId: string) {
  topicEvent('remove-reply-star');
  return modifyRatingAndSubscription(user, replyId, 'remove_reply_star_rating');
}

export function subscribeToTopic(user: ChromunityUser, id: string) {
  topicEvent('subscribe');
  return modifyRatingAndSubscription(user, id, 'subscribe_to_topic');
}

export function unsubscribeFromTopic(user: ChromunityUser, id: string) {
  topicEvent('unsubscribe');
  return modifyRatingAndSubscription(user, id, 'unsubscribe_from_topic');
}

function modifyRatingAndSubscription(user: ChromunityUser, id: string, rellOperation: string) {
  starRatingCache.remove(id);

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, id, uniqueId())
  );
}

export function getReplyStarRaters(topicId: string): Promise<string[]> {
  const query = 'get_star_rating_for_reply';
  return executeQuery(query, { id: topicId });
}

export function countTopicReplies(topicId: string): Promise<number> {
  const count: number = topicsCache.get(`${topicId}-reply_count`);

  if (count != null) {
    return new Promise<number>((resolve) => resolve(count));
  }

  const query = 'count_topic_replies';
  return executeQuery(query, { topic_id: topicId }).then((c: number) => {
    topicsCache.set(`${topicId}-reply_count`, c, 600);
    return c;
  });
}

export function getTopicSubscribers(topicId: string): Promise<string[]> {
  const query = 'get_subscribers_for_topic';
  return executeQuery(query, { id: topicId });
}

const ALLOWED_EDIT_DURATION = 5 * 60000;
export function getTopicById(id: string, user?: ChromunityUser, skipCache = false): Promise<Topic> {
  if (!skipCache) {
    const cachedTopic: Topic = topicsCache.get(id);

    if (cachedTopic != null && cachedTopic.timestamp < Date.now() + ALLOWED_EDIT_DURATION) {
      return new Promise<Topic>((resolve) => resolve(cachedTopic));
    }
  }

  const query = 'get_topic_by_id';

  return executeQuery(query, { username: user != null ? toLowerCase(user.name) : '', id })
    .catch(() => null)
    .then((topic: Topic) => {
      topicsCache.set(id, topic);
      return topic;
    });
}

export function getTopicsPriorToTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  return getTopicsForTimestamp(timestamp, pageSize, 'get_topics_prior_to_timestamp');
}

export function getTopicsAfterTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  return getTopicsForTimestamp(timestamp, pageSize, 'get_topics_after_timestamp');
}

function getTopicsForTimestamp(timestamp: number, pageSize: number, rellOperation: string): Promise<Topic[]> {
  return executeQuery(rellOperation, { timestamp, page_size: pageSize }).then((topics: Topic[]) => {
    topics.forEach((topic) => topicsCache.set(topic.id, topic, 300));
    return topics;
  });
}

export function getTopicsFromFollowsAfterTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsFromFollowsForTimestamp(user, timestamp, pageSize, 'get_topics_from_follows_after_timestamp');
}

export function getTopicsFromFollowsPriorToTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsFromFollowsForTimestamp(user, timestamp, pageSize, 'get_topics_from_follows_prior_to_timestamp');
}

function getTopicsFromFollowsForTimestamp(
  user: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string
): Promise<Topic[]> {
  return executeQuery(rellOperation, { name: toLowerCase(user), timestamp, page_size: pageSize });
}

export function countTopicsByUser(name: string) {
  return countByUser(name, 'count_topics_by_user');
}

export function countRepliesByUser(name: string) {
  return countByUser(name, 'count_replies_by_user');
}

export function countTopicStarRatingForUser(name: string) {
  return countByUser(name, 'count_user_topic_star_rating');
}

export function countReplyStarRatingForUser(name: string) {
  return countByUser(name, 'count_user_reply_star_rating');
}

function countByUser(name: string, rellOperation: string): Promise<number> {
  return executeQuery(rellOperation, { name: toLowerCase(name) });
}

export function getTopicsFromFollowedChannelsAfterTimestamp(username: string, timestamp: number, pageSize: number) {
  return getTopicsFromFollowedChannels(
    username,
    timestamp,
    pageSize,
    'get_topics_by_followed_channels_after_timestamp'
  );
}

export function getTopicsFromFollowedChannelsPriorToTimestamp(username: string, timestamp: number, pageSize: number) {
  return getTopicsFromFollowedChannels(
    username,
    timestamp,
    pageSize,
    'get_topics_by_followed_channels_prior_to_timestamp'
  );
}

export function getTopicsFromFollowedChannels(
  username: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string
): Promise<Topic[]> {
  return executeQuery(rellOperation, { username: toLowerCase(username), timestamp, page_size: pageSize }).then(
    (topics: Topic[]) => {
      const seen: Set<string> = new Set<string>();
      return topics.filter((item) => {
        const k = item.id;
        return seen.has(k) ? false : seen.add(k);
      });
    }
  );
}

export function getAllTopicsByPopularityAfterTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  const query = 'get_all_topics_by_stars_since_timestamp';
  return executeQuery(query, { timestamp, page_size: pageSize });
}

export function getTopicsByFollowsSortedByPopularityAfterTimestamp(
  name: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsByPopularityAfterTimestamp(
    name,
    timestamp,
    pageSize,
    'get_topics_by_follows_and_stars_since_timestamp'
  );
}

export function getTopicsByFollowedChannelSortedByPopularityAfterTimestamp(
  name: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsByPopularityAfterTimestamp(
    name,
    timestamp,
    pageSize,
    'get_topics_by_followed_channels_after_timestamp_sorted_by_popularity'
  );
}

export function getTopicsByChannelSortedByPopularityAfterTimestamp(
  name: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsByPopularityAfterTimestamp(
    toLowerCase(name),
    timestamp,
    pageSize,
    'get_topics_by_channel_after_timestamp_sorted_by_popularity'
  );
}

function getTopicsByPopularityAfterTimestamp(
  name: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string
): Promise<Topic[]> {
  return executeQuery(rellOperation, { name: toLowerCase(name), timestamp, page_size: pageSize });
}

export function getPoll(topicId: string): Promise<PollData> {
  return executeQuery('get_poll', { topic_id: topicId });
}

export function getPollVote(topicId: string, user: ChromunityUser): Promise<string> {
  return executeQuery('get_poll_vote', { topic_id: topicId, username: user.name });
}

export function voteForOptionInPoll(user: ChromunityUser, topicId: string, option: string) {
  topicEvent('poll-vote');
  return executeOperations(
    user.ft3User,
    op('vote_for_poll_option', topicId, user.ft3User.authDescriptor.id, toLowerCase(user.name), option)
  );
}
