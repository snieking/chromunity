import { ChromunityUser } from "../types";
import { executeOperations, executeQuery } from "./Postchain";
import { createStopwatchStarted, handleException, sortByFrequency, stopStopwatch, toLowerCase } from "../util/util";
import * as BoomerangCache from "boomerang-cache";
import { gaRellOperationTiming, gaRellQueryTiming, gaSocialEvent } from "../GoogleAnalytics";
import { nop, op } from "ft3-lib";

const channelsCache = BoomerangCache.create("channels-bucket", {
  storage: "session",
  encrypt: false
});

export function followChannel(user: ChromunityUser, name: string) {
  return modifyChannelollowing(user, name, "follow_channel");
}

export function unfollowChannel(user: ChromunityUser, name: string) {
  return modifyChannelollowing(user, name, "unfollow_channel");
}

export function getFollowedChannels(user: string): Promise<string[]> {
  const query = "get_followed_channels";
  const sw = createStopwatchStarted();

  return executeQuery(query, {
    username: toLowerCase(user)
  })
    .then((values: string[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return values;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

function modifyChannelollowing(user: ChromunityUser, channel: string, rellOperation: string) {
  channelsCache.remove(channel + ":followers");
  gaSocialEvent(rellOperation, channel);
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(rellOperation, user.name.toLocaleLowerCase(), user.ft3User.authDescriptor.id, channel.toLocaleLowerCase()),
    nop()
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function getTopicChannelBelongings(topicId: string): Promise<string[]> {
  const channelBelongings: string[] = channelsCache.get(topicId);

  if (channelBelongings != null) {
    return new Promise<string[]>(resolve => resolve(channelBelongings));
  }

  const query = "get_topic_channels_belongings";
  const sw = createStopwatchStarted();

  return executeQuery(query, { topic_id: topicId })
    .then((belongings: string[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      channelsCache.set(topicId, belongings, 3600);
      return belongings;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function getTrendingChannels(sinceDaysAgo: number): Promise<string[]> {
  var trending: string[] = channelsCache.get("trending");

  if (trending != null) {
    return new Promise<string[]>(resolve => resolve(trending));
  }

  const date: Date = new Date();
  const pastDate: number = date.getDate() - sinceDaysAgo;
  date.setDate(pastDate);

  const query = "get_channels_since";
  const sw = createStopwatchStarted();

  return executeQuery(query, { timestamp: date.getTime() / 1000 })
    .then((tags: string[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      trending = sortByFrequency(tags).slice(0, 10);
      channelsCache.set("trending", trending, 3600);
      return trending;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function countChannelFollowers(channelName: string): Promise<number> {
  const key: string = channelName + ":followers";
  const followers: number = channelsCache.get(key);

  if (followers != null) {
    return new Promise<number>(resolve => resolve(followers));
  }

  const query = "count_channel_followers";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: toLowerCase(channelName) })
    .then((count: number) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      channelsCache.set(key, count, 600);
      return count;
    })
    .catch((error: Error) => handleException(query, sw, error));
}
