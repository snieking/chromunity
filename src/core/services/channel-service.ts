import * as BoomerangCache from 'boomerang-cache';
import { nop, op } from 'ft3-lib';
import { ChromunityUser } from '../../types';
import { executeOperations, executeQuery } from './postchain';
import { sortByFrequency, toLowerCase } from '../../shared/util/util';
import { channelEvent } from '../../shared/util/matomo';

const channelsCache = BoomerangCache.create('channels-bucket', {
  storage: 'session',
  encrypt: false,
});

function modifyChannelollowing(user: ChromunityUser, channel: string, rellOperation: string) {
  channelsCache.remove(`${channel}:followers`);

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(channel)),
    nop()
  );
}

export function followChannel(user: ChromunityUser, name: string): Promise<unknown> {
  channelEvent('follow');
  return modifyChannelollowing(user, name, 'follow_channel');
}

export function unfollowChannel(user: ChromunityUser, name: string): Promise<unknown> {
  channelEvent('unfollow');
  return modifyChannelollowing(user, name, 'unfollow_channel');
}

export function getFollowedChannels(user: string): Promise<string[]> {
  const query = 'get_followed_channels';

  return executeQuery(query, {
    username: toLowerCase(user),
  });
}

export function getTopicChannelBelongings(topicId: string): Promise<string[]> {
  const channelBelongings: string[] = channelsCache.get(topicId);

  if (channelBelongings != null) {
    return new Promise<string[]>((resolve) => resolve(channelBelongings));
  }

  const query = 'get_topic_channels_belongings';

  return executeQuery(query, { topic_id: topicId }).then((belongings: string[]) => {
    channelsCache.set(topicId, belongings, 3600);
    return belongings;
  });
}

export function getTrendingChannels(sinceDaysAgo: number, limit = 15): Promise<string[]> {
  const trendingKey = `trending_${limit}`;
  let trending: string[] = channelsCache.get(trendingKey);

  if (trending != null) {
    return new Promise<string[]>((resolve) => resolve(trending));
  }

  const date: Date = new Date();
  const pastDate: number = date.getDate() - sinceDaysAgo;
  date.setDate(pastDate);

  const query = 'get_channels_since';

  return executeQuery(query, { timestamp: date.getTime() }).then((tags: string[]) => {
    trending = sortByFrequency(tags).slice(0, limit);
    channelsCache.set(trendingKey, trending, 3600);
    return trending;
  });
}

export function countChannelFollowers(channelName: string): Promise<number> {
  const key = `${channelName}:followers`;
  const followers: number = channelsCache.get(key);

  if (followers != null) {
    return new Promise<number>((resolve) => resolve(followers));
  }

  const query = 'count_channel_followers';

  return executeQuery(query, { name: toLowerCase(channelName) }).then((count: number) => {
    channelsCache.set(key, count, 600);
    return count;
  });
}
