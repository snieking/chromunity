import {User} from "../types";
import {seedToKey} from "./CryptoService";
import {GTX} from "./Postchain";
import {sortByFrequency, uniqueId} from "../util/util";
import * as BoomerangCache from "boomerang-cache";

const tagsCache = BoomerangCache.create("tags-bucket", { storage: "session", encrypt: false });

export function storeTagsFromTopic(user: User, topicId: string, tags: string[]) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createTopicTag", user.name, tags, topicId);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function storeTagsFromTopicReply(user: User, topicId: string, tags: string[], replyId: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createTopicReplyTag", user.name, tags, topicId, replyId);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function followTag(user: User, tag: string) {
    return modifyTagFollowing(user, tag, "createTagFollowing");
}

export function unfollowTag(user: User, tag: string) {
    return modifyTagFollowing(user, tag, "removeTagFollowing");
}

export function getFollowedTags(user: User): Promise<string[]> {
    return GTX.query("getFollowedTopics", { username: user.name });
}

function modifyTagFollowing(user: User, tag: string, rellOperation: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name, tag);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getTrendingTags(sinceDaysAgo: number): Promise<string[]> {
    var trending: string[] = tagsCache.get("trending");

    if (trending != null) {
        return new Promise<string[]>(resolve => resolve(trending));
    } 

    const date: Date = new Date();
    const pastDate: number = date.getDate() - sinceDaysAgo;
    date.setDate(pastDate);

    return GTX.query("getTagsSince", { timestamp: date.getTime() / 1000 })
        .then((tags: string[]) => {
            trending = sortByFrequency(tags).slice(0, 10);
            tagsCache.set("trending", trending, 3600);
            return trending;
        });
}
