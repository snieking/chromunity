import { GTX } from "./Postchain";
import { seedToKey } from "./CryptoService";
import { uniqueId } from "../util/util";
import * as BoomerangCache from "boomerang-cache";
import { User, Topic, TopicReply } from "../types";
import { storeTagsFromTopic, storeTagsFromTopicReply } from "./TagService";
import { sendNotifications } from "./NotificationService";

const topicsCache = BoomerangCache.create("topic-bucket", { storage: "session", encrypt: false });

export function createTopic(user: User, title: string, message: string) {
    const { privKey, pubKey } = seedToKey(user.seed);
    const topicId = uniqueId();

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createTopic", topicId, user.name, title, formatMessage(message));
    tx.sign(privKey, pubKey);

    return tx.postAndWaitConfirmation()
        .then((promise: any) => {
            const tags = getHashTags(message);

            if (tags != null && tags.length > 0) {
                storeTagsFromTopic(user, topicId, tags);
            }

            subscribeToTopic(user, topicId);

            return promise;
        });
}

export function createTopicReply(user: User, topicId: string, message: string) {
    const { privKey, pubKey } = seedToKey(user.seed);
    const replyId = uniqueId();

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createReply", topicId, replyId, user.name, formatMessage(message));
    tx.sign(privKey, pubKey);

    return postTopicReply(user, tx, topicId, message, replyId);
}

export function createTopicSubReply(user: User, topicId: string, replyId: string, message: string) {
    const { privKey, pubKey } = seedToKey(user.seed);
    const subReplyId = uniqueId();

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createSubReply", topicId, replyId, subReplyId, user.name, formatMessage(message));
    tx.sign(privKey, pubKey);
    return postTopicReply(user, tx, topicId, message, subReplyId);
}

function postTopicReply(user: User, tx: any, topicId: string, message: string, replyId: string) {
    return tx.postAndWaitConfirmation()
        .then((promise: any) => {
            const tags = getHashTags(message);

            if (tags != null && tags.length > 0) {
                storeTagsFromTopicReply(user, topicId, tags, replyId);
            }

            getTopicSubscribers(topicId)
                .then(users => sendNotifications(user,
                    createReplyTriggerString(user.name, topicId), message, users.filter(item => item !== user.name)));

            return promise;
        });
}

function createReplyTriggerString(name: string, id: string): string {
    return "@" + name + " replied to /t/" + id;
}

export function removeTopic(user: User, topicId: string) {
    topicsCache.remove(topicId);
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("removeTopic", user.name, topicId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function removeTopicReply(user: User, topicReplyId: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("removeTopicReply", user.name, topicReplyId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getTopicRepliesPriorToTimestamp(topicId: string, timestamp: number, pageSize: number): Promise<TopicReply[]> {
    return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, "getTopicRepliesPriorToTimestamp");
}

export function getTopicRepliesAfterTimestamp(topicId: string, timestamp: number, pageSize: number): Promise<TopicReply[]> {
    return getTopicRepliesForTimestamp(topicId, timestamp, pageSize, "getTopicRepliesAfterTimestamp");
}

function getTopicRepliesForTimestamp(topicId: string, timestamp: number, pageSize: number, rellOperation: string) {
    return GTX.query(rellOperation, { topicId: topicId, timestamp: timestamp, pageSize: pageSize });
}

export function getTopicSubReplies(replyId: string): Promise<TopicReply[]> {
    return GTX.query("getSubReplies", { parentReplyId: replyId });
}

export function getTopicsByUserPriorToTimestamp(username: string, timestamp: number, pageSize: number): Promise<Topic[]> {
    return GTX.query("getTopicsByUserIdPriorToTimestamp", { name: username, timestamp: timestamp, pageSize: pageSize })
        .then((topics: Topic[]) => {
            topics.forEach(topic => topicsCache.set(topic.id, topic));
            return topics;
        });
}

export function getTopicsByTagPriorToTimestamp(tag: string, timestamp: number, pageSize: number): Promise<Topic[]> {
    return GTX.query("getTopicsByTagPriorToTimestamp", { tag: tag, timestamp: timestamp, pageSize: pageSize })
        .then((topics: Topic[]) => {
            topics.forEach(topic => topicsCache.set(topic.id, topic));
            return topics;
        });
}

export function giveTopicStarRating(user: User, topicId: string) {
    return modifyRatingAndSubscription(user, topicId, "giveTopicStarRating");
}

export function removeTopicStarRating(user: User, topicId: string) {
    return modifyRatingAndSubscription(user, topicId, "removeTopicStarRating");
}

export function getTopicStarRaters(topicId: string): Promise<string[]> {
    return GTX.query("getStarRatingForTopic", { id: topicId });
}

export function giveReplyStarRating(user: User, replyId: string) {
    return modifyRatingAndSubscription(user, replyId, "giveReplyStarRating");
}

export function removeReplyStarRating(user: User, replyId: string) {
    return modifyRatingAndSubscription(user, replyId, "removeReplyStarRating");
}

export function subscribeToTopic(user: User, id: string) {
    return modifyRatingAndSubscription(user, id, "subscribeToTopic");
}

export function unsubscribeFromTopic(user: User, id: string) {
    return modifyRatingAndSubscription(user, id, "unsubscribeFromTopic");
}

function modifyRatingAndSubscription(user: User, id: string, rellOperation: string) {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name, id);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getReplyStarRaters(topicId: string): Promise<string[]> {
    return GTX.query("getStarRatingForReply", { id: topicId });
}

export function getTopicSubscribers(topicId: string): Promise<string[]> {
    return GTX.query("getSubscribersForTopic", { id: topicId });
}

export function getTopicById(id: string): Promise<Topic> {
    const cachedTopic: Topic = topicsCache.get(id);

    if (cachedTopic != null) {
        return new Promise<Topic>(resolve => resolve(cachedTopic));
    }

    return GTX.query("getTopicById", { id: id })
        .then((topic: Topic) => {
            topicsCache.set(id, topic, 300);
            return topic;
        });
}

export function getTopicsPriorToTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
    return getTopicsForTimestamp(timestamp, pageSize, "getTopicsPriorToTimestamp")
}

export function getTopicsAfterTimestamp(timestamp: number, pageSize: number): Promise<Topic[]> {
    return getTopicsForTimestamp(timestamp, pageSize, "getTopicsAfterTimestamp");
}

function getTopicsForTimestamp(timestamp: number, pageSize: number, rellOperation: string): Promise<Topic[]> {
    return GTX.query(rellOperation, { timestamp: timestamp, pageSize: pageSize })
        .then((topics: Topic[]) => {
            topics.forEach(topic => topicsCache.set(topic.id, topic));
            return topics;
        });
}

export function getTopicsFromFollowsAfterTimestamp(user: User, timestamp: number, pageSize: number): Promise<Topic[]> {
    return getTopicsFromFollowsForTimestamp(user, timestamp, pageSize, "getTopicsFromFollowsAfterTimestamp");
}

export function getTopicsFromFollowsPriorToTimestamp(user: User, timestamp: number, pageSize: number): Promise<Topic[]> {
    return getTopicsFromFollowsForTimestamp(user, timestamp, pageSize, "getTopicsFromFollowsPriorToTimestamp");
}

function getTopicsFromFollowsForTimestamp(user: User, timestamp: number, pageSize: number, rellOperation: string): Promise<Topic[]> {
    return GTX.query(rellOperation, { name: user.name, timestamp: timestamp, pageSize: pageSize });
}

export function getTopicsFromFollowedTagsPriorToTimestamp(user: User, timestamp: number, pageSize: number): Promise<Topic[]> {
    return GTX.query("getTopicsByFollowedTagsPriorToTimestamp", { username: user.name, timestamp: timestamp, pageSize: pageSize })
        .then((topics: Topic[]) => { 
            var seen: Set<string> = new Set<string>();
            return topics.filter(item => {
                let k = item.id;
                return seen.has(k) ? false : seen.add(k);
            })
        });
}

function formatMessage(message: string) {
    return message.replace(/[\r\n]\s*/g, '\n\n');
}

function getHashTags(inputText: string): string[] {
    const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    const matches = [];
    let match;

    while ((match = regex.exec(inputText))) {
        matches.push(match[1]);
    }

    return matches;
}