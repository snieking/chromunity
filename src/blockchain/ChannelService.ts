import { ChromunityUser } from "../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import { sortByFrequency } from "../util/util";
import * as BoomerangCache from "boomerang-cache";

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
  return GTX.query("get_followed_channels", {
    username: user.toLocaleLowerCase()
  });
}

function modifyChannelollowing(user: ChromunityUser, channel: string, rellOperation: string) {
  channelsCache.remove(channel + ":followers");
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      channel.toLocaleLowerCase()
    )
  );
}

export function getTopicChannelBelongings(topicId: string): Promise<string[]> {
  const channelBelongings: string[] = channelsCache.get(topicId);

  if (channelBelongings != null) {
    return new Promise<string[]>(resolve => resolve(channelBelongings));
  }

  return GTX.query("get_topic_channels_belongings", { topic_id: topicId }).then((belongings: string[]) => {
    channelsCache.set(topicId, belongings, 3600);
    return belongings;
  });
}

export function getTrendingChannels(sinceDaysAgo: number): Promise<string[]> {
  var trending: string[] = channelsCache.get("trending");

  if (trending != null) {
    return new Promise<string[]>(resolve => resolve(trending));
  }

  const date: Date = new Date();
  const pastDate: number = date.getDate() - sinceDaysAgo;
  date.setDate(pastDate);

  return GTX.query("get_channels_since", {
    timestamp: date.getTime() / 1000
  }).then((tags: string[]) => {
    trending = sortByFrequency(tags).slice(0, 10);
    channelsCache.set("trending", trending, 3600);
    return trending;
  });
}

export function countChannelFollowers(channelName: string): Promise<number> {
  const key: string = channelName + ":followers";
  const followers: number = channelsCache.get(key);

  if (followers != null) {
    return new Promise<number>(resolve => resolve(followers));
  }

  return GTX.query("count_channel_followers", {
    name: channelName.toLocaleLowerCase()
  }).then((count: number) => {
    channelsCache.set(key, count, 600);
    return count;
  });
}
