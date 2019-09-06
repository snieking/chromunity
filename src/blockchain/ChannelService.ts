import { ChromunityUser } from "../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import { createStopwatchStarted, handleGADuringException, sortByFrequency, stopStopwatch } from "../util/util";
import * as BoomerangCache from "boomerang-cache";
import { gaRellOperationTiming, gaRellQueryTiming, gaSocialEvent } from "../GoogleAnalytics";

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

  return GTX.query(query, {
    username: user.toLocaleLowerCase()
  }).then((values: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return values;
  }).catch((error: Error) => handleGADuringException(query, sw, error));
}

function modifyChannelollowing(user: ChromunityUser, channel: string, rellOperation: string) {
  channelsCache.remove(channel + ":followers");
  gaSocialEvent(rellOperation, channel);
  const sw = createStopwatchStarted();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      channel.toLocaleLowerCase()
    )
  ).then(value => {
    gaRellOperationTiming(rellOperation, stopStopwatch(sw));
    return value;
  }).catch((error: Error) => handleGADuringException(rellOperation, sw, error));
}

export function getTopicChannelBelongings(topicId: string): Promise<string[]> {
  const channelBelongings: string[] = channelsCache.get(topicId);

  if (channelBelongings != null) {
    return new Promise<string[]>(resolve => resolve(channelBelongings));
  }

  const query = "get_topic_channels_belongings";
  const sw = createStopwatchStarted();

  return GTX.query(query, { topic_id: topicId }).then((belongings: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    channelsCache.set(topicId, belongings, 3600);
    return belongings;
  }).catch((error: Error) => handleGADuringException(query, sw, error));
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

  return GTX.query(query, {
    timestamp: date.getTime() / 1000
  }).then((tags: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    trending = sortByFrequency(tags).slice(0, 10);
    channelsCache.set("trending", trending, 3600);
    return trending;
  }).catch((error: Error) => handleGADuringException(query, sw, error));
}

export function countChannelFollowers(channelName: string): Promise<number> {
  const key: string = channelName + ":followers";
  const followers: number = channelsCache.get(key);

  if (followers != null) {
    return new Promise<number>(resolve => resolve(followers));
  }

  const query = "count_channel_followers";
  const sw = createStopwatchStarted();

  return GTX.query(query, {
    name: channelName.toLocaleLowerCase()
  }).then((count: number) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    channelsCache.set(key, count, 600);
    return count;
  }).catch((error: Error) => handleGADuringException(query, sw, error));
}
