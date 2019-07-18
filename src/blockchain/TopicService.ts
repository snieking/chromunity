import { GTX } from "./Postchain";
import { seedToKey } from "./CryptoService";
import { uniqueId } from "../util/util";
import * as BoomerangCache from "boomerang-cache";
import { User, Topic, TopicReply } from "../types";
import { storeTagsFromTopic } from "./TagService";
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

            if (tags != null) {
                storeTagsFromTopic(user, topicId, tags);
            }

            return promise;
        });
}

export function createTopicReply(user: User, topicId: string, message: string) {
    const { privKey, pubKey } = seedToKey(user.seed);
    const replyId = uniqueId();

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createReply", topicId, replyId, user.name, formatMessage(message));
    tx.sign(privKey, pubKey);

    return tx.postAndWaitConfirmation()
        .then((promise: any) => {
            const tags = getHashTags(message);

            if (tags != null && tags.length > 0) {
                console.log("Storing tags: ", tags);
                storeTagsFromTopic(user, topicId, tags);
            }

            getTopicStarRaters(topicId)
                .then(users => sendNotifications(user,
                    createReplyTriggerString(user.name, topicId), message, users.filter(item => item !== user.name)));

            return promise;
        });
}

function createReplyTriggerString(name: string, id: string): string {
    return "@" + name + " replied to /t/" + id;
}

export function getTopicReplies(topicId: string): Promise<TopicReply[]> {
    return GTX.query("getTopicReplies", { topicId: topicId });
}

export function getTopicsByUserPriorToTimestamp(username: string, timestamp: number): Promise<Topic[]> {
    return GTX.query("getTopicsByUserIdPriorToTimestamp", { name: username, timestamp: timestamp })
        .then((topics: Topic[]) => {
            topics.forEach(topic => topicsCache.set(topic.id, topic));
            return topics;
        });
}

export function getTopicsByTagPriorToTimestamp(tag: string, timestamp: number): Promise<Topic[]> {
    return GTX.query("getTopicsByTagPriorToTimestamp", { tag: tag, timestamp: timestamp })
        .then((topics: Topic[]) => {
            topics.forEach(topic => topicsCache.set(topic.id, topic));
            return topics;
        });
}

export function giveTopicStarRating(user: User, topicId: string) {
    return modifyTopicStarRating(user, topicId, "giveTopicStarRating");
}

export function removeTopicStarRating(user: User, topicId: string) {
    return modifyTopicStarRating(user, topicId, "removeTopicStarRating");
}

function modifyTopicStarRating(user: User, topicId: string, rellOperation: string) {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name, topicId);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getTopicStarRaters(topicId: string): Promise<string[]> {
    return GTX.query("getStarRatingForTopic", { id: topicId });
}

export function giveReplyStarRating(user: User, topicId: string) {
    return modifyReplyStarRating(user, topicId, "giveReplyStarRating");
}

export function removeReplyStarRating(user: User, topicId: string) {
    return modifyReplyStarRating(user, topicId, "removeReplyStarRating");
}

function modifyReplyStarRating(user: User, topicId: string, rellOperation: string) {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name, topicId);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getReplyStarRaters(topicId: string): Promise<string[]> {
    return GTX.query("getStarRatingForReply", { id: topicId });
}

export function getTopicById(id: string): Promise<Topic> {
    const cachedTopic: Topic = topicsCache.get(id);

    if (cachedTopic != null) {
        return new Promise<Topic>(resolve => resolve(cachedTopic));
    }

    return GTX.query("getTopicById", { id: id })
        .then((topic: Topic) => {
            topicsCache.set(id, topic);
            return topic;
        });
}

export function getTopicsPriorToTimestamp(timestamp: number) {
    return getTopicsForTimestamp(timestamp, "getTopicsPriorToTimestamp")
}

export function getTopicsAfterTimestamp(timestamp: number) {
    return getTopicsForTimestamp(timestamp, "getTopicsAfterTimestamp");
}

function getTopicsForTimestamp(timestamp: number, rellOperation: string) {
    return GTX.query(rellOperation, { timestamp: timestamp })
        .then((topics: Topic[]) => {
            topics.forEach(topic => topicsCache.set(topic.id, topic));
            return topics;
        });
}

export function getTopicsFromFollowsAfterTimestamp(user: User, timestamp: number): Promise<Topic[]> {
    return getTopicsFromFollowsForTimestamp(user, timestamp, "getTopicsFromFollowsAfterTimestamp");
}

export function getTopicsFromFollowsPriorToTimestamp(user: User, timestamp: number): Promise<Topic[]> {
    return getTopicsFromFollowsForTimestamp(user, timestamp, "getTopicsFromFollowsPriorToTimestamp");
}

function getTopicsFromFollowsForTimestamp(user: User, timestamp: number, rellOperation: string): Promise<Topic[]> {
    return GTX.query(rellOperation, { name: user.name, timestamp: timestamp });
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