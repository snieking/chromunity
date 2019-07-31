import {User} from "../types";
import {seedToKey} from "./CryptoService";
import {GTX} from "./Postchain";
import {sortByFrequency, uniqueId} from "../util/util";
import * as BoomerangCache from "boomerang-cache";

const channelsCache = BoomerangCache.create("channels-bucket", { storage: "session", encrypt: false });

export function followChannel(user: User, name: string) {
    return modifyChannelollowing(user, name, "follow_channel");
}

export function unfollowChannel(user: User, name: string) {
    return modifyChannelollowing(user, name, "unfollow_channel");
}

export function getFollowedChannels(user: string): Promise<string[]> {
    return GTX.query("get_followed_channels", { username: user});
}

function modifyChannelollowing(user: User, channel: string, rellOperation: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name, channel.toLocaleLowerCase());
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getTopicChannelBelongings(topicId: string): Promise<string[]> {
    const channelBelongings: string[] = channelsCache.get(topicId);

    if (channelBelongings != null) {
        return new Promise<string[]>(resolve => resolve(channelBelongings));
    }

    return GTX.query("get_topic_channels_belongings", { topic_id: topicId })
        .then((belongings: string[]) => {
            channelsCache.set(topicId, belongings, 3600);
            return belongings;
        })
}

export function getTrendingChannels(sinceDaysAgo: number): Promise<string[]> {
    var trending: string[] = channelsCache.get("trending");

    if (trending != null) {
        return new Promise<string[]>(resolve => resolve(trending));
    } 

    const date: Date = new Date();
    const pastDate: number = date.getDate() - sinceDaysAgo;
    date.setDate(pastDate);

    return GTX.query("get_channels_since", { timestamp: date.getTime() / 1000 })
        .then((tags: string[]) => {
            trending = sortByFrequency(tags).slice(0, 10);
            channelsCache.set("trending", trending, 3600);
            return trending;
        });
}
