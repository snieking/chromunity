import { BLOCKCHAIN, executeQuery, executeOperations } from "./Postchain";
import { createStopwatchStarted, handleException, stopStopwatch, toLowerCase, uniqueId } from "../util/util";
import * as BoomerangCache from "boomerang-cache";
import { Topic, TopicReply, ChromunityUser } from "../types";
import { sendNotifications } from "./NotificationService";
import { gaRellOperationTiming, gaRellQueryTiming } from "../GoogleAnalytics";
import { op } from "ft3-lib";

const topicsCache = BoomerangCache.create("topic-bucket", {
  storage: "session",
  encrypt: false
});

const starRatingCache = BoomerangCache.create("rating-bucket", {
  storage: "session",
  encrypt: false
});

export const removeTopicIdFromCache = (id: string) => topicsCache.remove(id);

export function createTopic(user: ChromunityUser, channelName: string, title: string, message: string) {
  const topicId = uniqueId();

  const operation = "create_topic";
  const sw = createStopwatchStarted();

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
  )
    .then((promise: unknown) => {
      gaRellOperationTiming("create_topic", stopStopwatch(sw));

      subscribeToTopic(user, topicId).then();
      return promise;
    })
    .catch(error => handleException(operation, sw, error));
}

export function modifyTopic(user: ChromunityUser, topicId: string, updatedText: string) {
  topicsCache.remove(topicId);
  return modifyText(user, topicId, updatedText, "modify_topic");
}

export function modifyReply(user: ChromunityUser, replyId: string, updatedText: string) {
  return modifyText(user, replyId, updatedText, "modify_reply");
}

export function deleteReply(user: ChromunityUser, replyId: string) {
  const rellOperation = "delete_reply";
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(rellOperation, replyId, user.ft3User.authDescriptor.id, toLowerCase(user.name))
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch(error => handleException(rellOperation, sw, error));
}

function modifyText(user: ChromunityUser, id: string, updatedText: string, rellOperation: string) {
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(rellOperation, id, user.ft3User.authDescriptor.id, toLowerCase(user.name), updatedText)
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch(error => handleException(rellOperation, sw, error));
}

export function deleteTopic(user: ChromunityUser, id: string) {
  topicsCache.remove(id);
  const rellOperation = "delete_topic";
  const sw = createStopwatchStarted();

  return executeOperations(user.ft3User, op(rellOperation, id, user.ft3User.authDescriptor.id, toLowerCase(user.name)))
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch(error => handleException(rellOperation, sw, error));
}

export function createTopicReply(user: ChromunityUser, topicId: string, message: string) {
  const replyId = uniqueId();

  const rellOperation = "create_reply";
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(rellOperation, topicId, user.ft3User.authDescriptor.id, replyId, toLowerCase(user.name), message)
  )
    .then((promise: unknown) => {
      gaRellOperationTiming("create_reply", stopStopwatch(sw));

      getTopicSubscribers(topicId).then(users =>
        sendNotifications(
          user,
          createReplyTriggerString(user.name, topicId, replyId),
          message,
          users.map(name => name.toLocaleLowerCase()).filter(item => item !== user.name)
        )
      );
      return promise;
    })
    .catch(error => handleException(rellOperation, sw, error));
}

export function createTopicSubReply(
  user: ChromunityUser,
  topicId: string,
  replyId: string,
  message: string,
  replyTo: string
) {
  const subReplyId = uniqueId();

  const operation = "create_sub_reply";
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(operation, topicId, user.ft3User.authDescriptor.id, replyId, subReplyId, toLowerCase(user.name), message)
  )
    .then((promise: unknown) => {
      gaRellOperationTiming("create_sub_reply", stopStopwatch(sw));
      getTopicSubscribers(topicId).then(users => {
        if (!users.includes(replyTo.toLocaleLowerCase())) {
          users.push(replyTo);
        }

        sendNotifications(
          user,
          createReplyTriggerString(user.name, topicId, subReplyId),
          message,
          users.map(name => name.toLocaleLowerCase()).filter(item => item !== user.name)
        );
      });
      return promise;
    })
    .catch(error => handleException(operation, sw, error));
}

function createReplyTriggerString(name: string, id: string, replyId: string): string {
  const topic: Topic = topicsCache.get(id);
  return "@" + name + " replied to '" + topic.title + "' /t/" + id + "#" + replyId;
}

export function getTopicRepliesPriorToTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number,
  user?: ChromunityUser
): Promise<TopicReply[]> {
  return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, "get_topic_replies_prior_to_timestamp", user);
}

export function getTopicRepliesAfterTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number,
  user?: ChromunityUser
): Promise<TopicReply[]> {
  return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, "get_topic_replies_after_timestamp", user);
}

function getTopicRepliesForTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string,
  user?: ChromunityUser
) {
  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc =>
    bc.query(rellOperation, {
      username: user !== undefined ? toLowerCase(user.name) : "",
      topic_id: topicId,
      timestamp,
      page_size: pageSize
    })
  )
    .then(value => {
      gaRellQueryTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch(error => handleException(rellOperation, sw, error));
}

export function getTopicRepliesByUserPriorToTimestamp(
  name: string,
  timestamp: number,
  pageSize: number
): Promise<TopicReply[]> {
  const query = "get_topic_replies_by_user_prior_to_timestamp";
  const sw = createStopwatchStarted();
  return executeQuery(query, { name: toLowerCase(name), timestamp, page_size: pageSize })
    .then((replies: TopicReply[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return replies;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function getTopicSubReplies(replyId: string, user?: ChromunityUser): Promise<TopicReply[]> {
  return executeQuery("get_sub_replies", {
    username: user !== undefined ? toLowerCase(user.name) : "",
    parent_reply_id: replyId
  });
}

export function getTopicsByUserPriorToTimestamp(
  username: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  const query = "get_topics_by_user_id_prior_to_timestamp";
  const sw = createStopwatchStarted();
  return executeQuery(query, { name: toLowerCase(username), timestamp, page_size: pageSize })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      topics.forEach(topic => topicsCache.set(topic.id, topic));
      return topics;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function getTopicsByChannelPriorToTimestamp(
  channelName: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  const query = "get_topics_by_channel_prior_to_timestamp";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: toLowerCase(channelName), timestamp, page_size: pageSize })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      topics.forEach(topic => topicsCache.set(topic.id, topic));
      return topics;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function getTopicsByChannelAfterTimestamp(channelName: string, timestamp: number): Promise<Topic[]> {
  const query = "get_topics_by_channel_after_timestamp";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: toLowerCase(channelName), timestamp })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      topics.forEach(topic => topicsCache.set(topic.id, topic));
      return topics;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function countTopicsInChannel(channelName: string): Promise<number> {
  const query = "count_topics_by_channel";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: toLowerCase(channelName) })
    .then((value: number) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function getTopicStarRaters(topicId: string, clearCache = false): Promise<string[]> {
  if (clearCache) {
    starRatingCache.remove(topicId);
  } else {
    const raters: string[] = starRatingCache.get(topicId);

    if (raters != null) {
      return new Promise<string[]>(resolve => resolve(raters));
    }
  }

  const query = "get_star_rating_for_topic";
  const sw = createStopwatchStarted();
  return executeQuery(query, { id: topicId })
    .then((raters: string[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      starRatingCache.set(topicId, raters, 600);
      return raters;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function giveTopicStarRating(user: ChromunityUser, topicId: string) {
  return modifyRatingAndSubscription(user, topicId, "give_topic_star_rating");
}

export function removeTopicStarRating(user: ChromunityUser, topicId: string) {
  return modifyRatingAndSubscription(user, topicId, "remove_topic_star_rating");
}

export function giveReplyStarRating(user: ChromunityUser, replyId: string) {
  return modifyRatingAndSubscription(user, replyId, "give_reply_star_rating");
}

export function removeReplyStarRating(user: ChromunityUser, replyId: string) {
  return modifyRatingAndSubscription(user, replyId, "remove_reply_star_rating");
}

export function subscribeToTopic(user: ChromunityUser, id: string) {
  return modifyRatingAndSubscription(user, id, "subscribe_to_topic");
}

export function unsubscribeFromTopic(user: ChromunityUser, id: string) {
  return modifyRatingAndSubscription(user, id, "unsubscribe_from_topic");
}

function modifyRatingAndSubscription(user: ChromunityUser, id: string, rellOperation: string) {
  starRatingCache.remove(id);
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, id, uniqueId())
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function getReplyStarRaters(topicId: string): Promise<string[]> {
  const query = "get_star_rating_for_reply";
  const sw = createStopwatchStarted();
  return executeQuery(query, { id: topicId }).then((raters: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return raters;
  });
}

export function countTopicReplies(topicId: string): Promise<number> {
  const count: number = topicsCache.get(topicId + "-reply_count");

  if (count != null) {
    return new Promise<number>(resolve => resolve(count));
  }

  const query = "count_topic_replies";
  const sw = createStopwatchStarted();
  return executeQuery(query, { topic_id: topicId }).then((count: number) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    topicsCache.set(topicId + "-reply_count", count, 600);
    return count;
  });
}

export function getTopicSubscribers(topicId: string): Promise<string[]> {
  const query = "get_subscribers_for_topic";
  const sw = createStopwatchStarted();
  return executeQuery(query, { id: topicId })
    .then((subs: string[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return subs;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function getTopicById(id: string, user?: ChromunityUser): Promise<Topic> {
  const cachedTopic: Topic = topicsCache.get(id);

  if (cachedTopic != null) {
    return new Promise<Topic>(resolve => resolve(cachedTopic));
  }

  const query = "get_topic_by_id";
  const sw = createStopwatchStarted();

  return executeQuery(query, { username: user !== undefined ? toLowerCase(user.name) : "", id })
    .then((topic: Topic) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      topicsCache.set(id, topic, 300);
      return topic;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function getTopicsPriorToTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  return getTopicsForTimestamp(timestamp, pageSize, "get_topics_prior_to_timestamp");
}

export function getTopicsAfterTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  return getTopicsForTimestamp(timestamp, pageSize, "get_topics_after_timestamp");
}

function getTopicsForTimestamp(timestamp: number, pageSize: number, rellOperation: string): Promise<Topic[]> {
  const sw = createStopwatchStarted();

  return executeQuery(rellOperation, { timestamp, page_size: pageSize })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(rellOperation, stopStopwatch(sw));
      topics.forEach(topic => topicsCache.set(topic.id, topic));
      return topics;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function getTopicsFromFollowsAfterTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsFromFollowsForTimestamp(user, timestamp, pageSize, "get_topics_from_follows_after_timestamp");
}

export function getTopicsFromFollowsPriorToTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsFromFollowsForTimestamp(user, timestamp, pageSize, "get_topics_from_follows_prior_to_timestamp");
}

function getTopicsFromFollowsForTimestamp(
  user: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string
): Promise<Topic[]> {
  const sw = createStopwatchStarted();

  return executeQuery(rellOperation, { name: toLowerCase(user), timestamp, page_size: pageSize })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(rellOperation, stopStopwatch(sw));
      return topics;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function countTopicsByUser(name: string) {
  return countByUser(name, "count_topics_by_user");
}

export function countRepliesByUser(name: string) {
  return countByUser(name, "count_replies_by_user");
}

export function countTopicStarRatingForUser(name: string) {
  return countByUser(name, "count_user_topic_star_rating");
}

export function countReplyStarRatingForUser(name: string) {
  return countByUser(name, "count_user_reply_star_rating");
}

function countByUser(name: string, rellOperation: string): Promise<number> {
  const sw = createStopwatchStarted();
  return executeQuery(rellOperation, { name: toLowerCase(name) })
    .then((count: number) => {
      gaRellQueryTiming(rellOperation, stopStopwatch(sw));
      return count;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function getTopicsFromFollowedChannelsAfterTimestamp(username: string, timestamp: number, pageSize: number) {
  return getTopicsFromFollowedChannels(
    username,
    timestamp,
    pageSize,
    "get_topics_by_followed_channels_after_timestamp"
  );
}

export function getTopicsFromFollowedChannelsPriorToTimestamp(username: string, timestamp: number, pageSize: number) {
  return getTopicsFromFollowedChannels(
    username,
    timestamp,
    pageSize,
    "get_topics_by_followed_channels_prior_to_timestamp"
  );
}

export function getTopicsFromFollowedChannels(
  username: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string
): Promise<Topic[]> {
  const sw = createStopwatchStarted();
  return executeQuery(rellOperation, { username: toLowerCase(username), timestamp, page_size: pageSize })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(rellOperation, stopStopwatch(sw));
      var seen: Set<string> = new Set<string>();
      return topics.filter(item => {
        let k = item.id;
        return seen.has(k) ? false : seen.add(k);
      });
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function getAllTopicsByPopularityAfterTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  const query = "get_all_topics_by_stars_since_timestamp";
  const sw = createStopwatchStarted();
  return executeQuery(query, { timestamp, page_size: pageSize })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return topics;
    })
    .catch((error: Error) => handleException(query, sw, error));
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
    "get_topics_by_follows_and_stars_since_timestamp"
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
    "get_topics_by_followed_channels_after_timestamp_sorted_by_popularity"
  );
}

export function getTopicsByChannelSortedByPopularityAfterTimestamp(
  name: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return getTopicsByPopularityAfterTimestamp(
    name.toLocaleLowerCase(),
    timestamp,
    pageSize,
    "get_topics_by_channel_after_timestamp_sorted_by_popularity"
  );
}

function getTopicsByPopularityAfterTimestamp(
  name: string,
  timestamp: number,
  pageSize: number,
  rellOperation: string
): Promise<Topic[]> {
  const sw = createStopwatchStarted();
  return executeQuery(rellOperation, { name: toLowerCase(name), timestamp, page_size: pageSize })
    .then((topics: Topic[]) => {
      gaRellQueryTiming(rellOperation, stopStopwatch(sw));
      return topics;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}
