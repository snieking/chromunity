import { BLOCKCHAIN, GTX } from "./Postchain";
import { uniqueId } from "../util/util";
import * as BoomerangCache from "boomerang-cache";
import { Topic, TopicReply, ChromunityUser } from "../types";
import { sendNotifications } from "./NotificationService";

const topicsCache = BoomerangCache.create("topic-bucket", {
  storage: "session",
  encrypt: false
});

const starRatingCache = BoomerangCache.create("rating-bucket", {
  storage: "session",
  encrypt: false
});

export function createTopic(user: ChromunityUser, channelName: string, title: string, message: string) {
  const topicId = uniqueId();

  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      "create_topic",
      topicId,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name.toLocaleLowerCase(),
      channelName.toLocaleLowerCase(),
      channelName,
      title,
      message
    );
  }).then((promise: unknown) => {
    subscribeToTopic(user, topicId);
    return promise;
  });
}

export function modifyTopic(user: ChromunityUser, topicId: string, updatedText: string) {
  topicsCache.remove(topicId);
  return modifyText(user, topicId, updatedText, "modify_topic");
}

export function modifyReply(user: ChromunityUser, replyId: string, updatedText: string) {
  return modifyText(user, replyId, updatedText, "modify_reply");
}

function modifyText(user: ChromunityUser, id: string, updatedText: string, rellOperation: string) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
      id,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name.toLocaleLowerCase(),
      updatedText
    )
  );
}

export function createTopicReply(user: ChromunityUser, topicId: string, message: string) {
  const replyId = uniqueId();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "create_reply",
      topicId,
      user.ft3User.authDescriptor.hash().toString("hex"),
      replyId,
      user.name.toLocaleLowerCase(),
      message
    )
  ).then((promise: unknown) => {
    getTopicSubscribers(topicId).then(users =>
      sendNotifications(
        user,
        createReplyTriggerString(user.name, topicId),
        message,
        users.map(name => name.toLocaleLowerCase()).filter(item => item !== user.name)
      )
    );
    return promise;
  });
}

export function createTopicSubReply(user: ChromunityUser, topicId: string, replyId: string, message: string) {
  const subReplyId = uniqueId();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "create_sub_reply",
      topicId,
      user.ft3User.authDescriptor.hash().toString("hex"),
      replyId,
      subReplyId,
      user.name.toLocaleLowerCase(),
      message
    )
  ).then((promise: unknown) => {
    getTopicSubscribers(topicId).then(users =>
      sendNotifications(
        user,
        createReplyTriggerString(user.name, topicId),
        message,
        users.map(name => name.toLocaleLowerCase()).filter(item => item !== user.name)
      )
    );
    return promise;
  });
}

function createReplyTriggerString(name: string, id: string): string {
  return "@" + name + " replied to /t/" + id;
}

export function removeTopic(user: ChromunityUser, topicId: string) {
  topicsCache.remove(topicId);
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "remove_topic",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      topicId
    )
  );
}

export function removeTopicReply(user: ChromunityUser, topicReplyId: string) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "remove_topic_reply",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      topicReplyId
    )
  );
}

export function getTopicRepliesPriorToTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number
): Promise<TopicReply[]> {
  return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, "get_topic_replies_prior_to_timestamp");
}

export function getTopicRepliesAfterTimestamp(
  topicId: string,
  timestamp: number,
  pageSize: number
): Promise<TopicReply[]> {
  return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, "get_topic_replies_after_timestamp");
}

function getTopicRepliesForTimestamp(topicId: string, timestamp: number, pageSize: number, rellOperation: string) {
  return BLOCKCHAIN.then(bc =>
    bc.query(rellOperation, {
      topic_id: topicId,
      timestamp: timestamp,
      page_size: pageSize
    })
  );
}

export function getTopicRepliesByUserPriorToTimestamp(
  name: string,
  timestamp: number,
  pageSize: number
): Promise<TopicReply[]> {
  return GTX.query("get_topic_replies_by_user_prior_to_timestamp", {
    name: name.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  });
}

export function getTopicSubReplies(replyId: string): Promise<TopicReply[]> {
  return GTX.query("get_sub_replies", { parent_reply_id: replyId });
}

export function getTopicsByUserPriorToTimestamp(
  username: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return GTX.query("get_topics_by_user_id_prior_to_timestamp", {
    name: username.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  }).then((topics: Topic[]) => {
    topics.forEach(topic => topicsCache.set(topic.id, topic));
    return topics;
  });
}

export function getTopicsByChannelPriorToTimestamp(
  channelName: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return GTX.query("get_topics_by_channel_prior_to_timestamp", {
    name: channelName.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  }).then((topics: Topic[]) => {
    topics.forEach(topic => topicsCache.set(topic.id, topic));
    return topics;
  });
}

export function getTopicsByChannelAfterTimestamp(channelName: string, timestamp: number): Promise<Topic[]> {
  return GTX.query("get_topics_by_channel_after_timestamp", {
    name: channelName.toLocaleLowerCase(),
    timestamp: timestamp
  }).then((topics: Topic[]) => {
    topics.forEach(topic => topicsCache.set(topic.id, topic));
    return topics;
  });
}

export function countTopicsInChannel(channelName: string): Promise<number> {
  return GTX.query("count_topics_by_channel", {
    name: channelName.toLocaleLowerCase()
  });
}

export function giveTopicStarRating(user: ChromunityUser, topicId: string) {
  return modifyRatingAndSubscription(user, topicId, "give_topic_star_rating");
}

export function removeTopicStarRating(user: ChromunityUser, topicId: string) {
  return modifyRatingAndSubscription(user, topicId, "remove_topic_star_rating");
}

export function getTopicStarRaters(topicId: string): Promise<string[]> {
  const raters: string[] = starRatingCache.get(topicId);

  if (raters != null) {
    return new Promise<string[]>(resolve => resolve(raters));
  }

  return GTX.query("get_star_rating_for_topic", { id: topicId })
    .then((raters: string[]) => {
      starRatingCache.set(topicId, raters, 600);
      return raters;
    });
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
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      id,
      uniqueId()
    )
  );
}

export function getReplyStarRaters(topicId: string): Promise<string[]> {
  return GTX.query("get_star_rating_for_reply", { id: topicId });
}

export function getTopicSubscribers(topicId: string): Promise<string[]> {
  return GTX.query("get_subscribers_for_topic", { id: topicId });
}

export function getTopicById(id: string): Promise<Topic> {
  const cachedTopic: Topic = topicsCache.get(id);

  if (cachedTopic != null) {
    return new Promise<Topic>(resolve => resolve(cachedTopic));
  }

  return GTX.query("get_topic_by_id", { id: id }).then((topic: Topic) => {
    topicsCache.set(id, topic, 300);
    return topic;
  });
}

export function getTopicsPriorToTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  return getTopicsForTimestamp(timestamp, pageSize, "get_topics_prior_to_timestamp");
}

export function getTopicsAfterTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  return getTopicsForTimestamp(timestamp, pageSize, "get_topics_after_timestamp");
}

function getTopicsForTimestamp(timestamp: number, pageSize: number, rellOperation: string): Promise<Topic[]> {
  return GTX.query(rellOperation, {
    timestamp: timestamp,
    page_size: pageSize
  }).then((topics: Topic[]) => {
    topics.forEach(topic => topicsCache.set(topic.id, topic));
    return topics;
  });
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
  return GTX.query(rellOperation, {
    name: user.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  });
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
  return GTX.query(rellOperation, { name: name.toLocaleLowerCase() });
}

export function getTopicsFromFollowedChannelsPriorToTimestamp(
  username: string,
  timestamp: number,
  pageSize: number
): Promise<Topic[]> {
  return GTX.query("get_topics_by_followed_channels_prior_to_timestamp", {
    username: username.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  }).then((topics: Topic[]) => {
    var seen: Set<string> = new Set<string>();
    return topics.filter(item => {
      let k = item.id;
      return seen.has(k) ? false : seen.add(k);
    });
  });
}

export function getAllTopicsByPopularityAfterTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
  return GTX.query("get_all_topics_by_stars_since_timestamp", {
    timestamp: timestamp,
    page_size: pageSize
  });
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
  return GTX.query(rellOperation, {
    name: name.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  });
}
