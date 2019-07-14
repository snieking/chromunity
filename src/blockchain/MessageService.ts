import { GTX } from "./Postchain";
import { seedToKey } from "./CryptoService";
import { uniqueId } from "../util/util";
import { Thread, User } from "../types";
import * as BoomerangCache from "boomerang-cache";
import { storeTagsFromThread } from "./TagService";
import { sendUserNotifications } from "./NotificationService";

const boomerang = BoomerangCache.create("message-bucket", { storage: "local", encrypt: true });

export function createThread(user: User, message: string): Promise<any> {
    boomerang.remove("threads");

    const { privKey, pubKey } = seedToKey(user.seed);
    const threadId = uniqueId();

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createThread", user.name, threadId, "", formatMessage(message));
    tx.sign(privKey, pubKey);

    return tx.postAndWaitConfirmation()
        .then((promise: any) => {
            const tags = getHashTags(message);

            if (tags != null) {
                storeTagsFromThread(user, threadId, tags);
            }

            const users = getUsers(message);

            if (users != null) {
                sendUserNotifications(user, threadId, users);
            }

            return promise;
        });
}

export function createSubThread(user: User, rootThreadId: string, rootThreadAuthor: string, message: string) {
    const { privKey, pubKey } = seedToKey(user.seed);
    const tx = GTX.newTransaction([pubKey]);

    const threadId = uniqueId();
    tx.addOperation("createThread", user.name, threadId, rootThreadId, formatMessage(message));
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation().then(() => {
        const tags = getHashTags(message);
        if (tags != null) {
            storeTagsFromThread(user, threadId, tags);
        }

        const users = getUsers(message);
        users.add(rootThreadAuthor);

        if (users != null) {
            sendUserNotifications(user, threadId, users);
        }
    });
}

function formatMessage(message: string) {
    return message.replace(/[\r\n]\s*/g, '\n\n');
}

export function getThreadsPriorTo(timestamp: number): Promise<Thread[]> {
    return getThreadsForTimestamp(timestamp, "getThreadsPriorTo");
}

export function getThreadsAfter(timestamp: number): Promise<Thread[]> {
    return getThreadsForTimestamp(timestamp, "getThreadsAfter");
}

function getThreadsForTimestamp(timestamp: number, rellOperation: string): Promise<Thread[]> {
    return GTX.query(rellOperation, { timestamp: timestamp })
        .then((threads: Thread[]) => {
            threads.forEach(thread => boomerang.set(thread.id, thread));
            return threads;
        });
}

export function getThreadsByUserIdPriorToTimestamp(userId: string, timestamp: number): Promise<Thread[]> {
    return GTX.query("getThreadsByUserIdPriorToTimestamp", { name: userId, timestamp: timestamp });
}

export function getThreadsFromFollowsPriorToTimestamp(user: User, timestamp: number): Promise<Thread[]> {
    return GTX.query("getThreadsFromFollowsPriorToTimestamp", { name: user.name, timestamp: timestamp });
}

export function getThreadsFromFollowsAfterTimestamp(user: User, timestamp: number): Promise<Thread[]> {
    return GTX.query("getThreadsFromFollowsAfterTimestamp", { name: user.name, timestamp: timestamp });
}

export function getThreadById(threadId: string): Promise<Thread> {
    const thread: Thread = boomerang.get(threadId);

    if (thread != null) {
        return new Promise<Thread>(resolve => resolve(thread));
    } else {
        return GTX.query("getThreadById", { id: threadId })
            .then((retrievedThread: Thread) => {
                boomerang.set(threadId, retrievedThread);
                return retrievedThread;
            });
    }
}

export function getSubThreadsByParentId(rootThreadId: string): Promise<Thread[]> {
    return GTX.query("getSubThreads", { rootThreadId: rootThreadId });
}

export function getThreadsByTagPriorToTimestamp(tag: string, timestamp: number): Promise<Thread[]> {
    return GTX.query("getThreadsByTagPriorToTimestamp", { tag: tag, timestamp: timestamp });
}

export function starRate(user: User, id: string) {
    return updateStarRating(user, id, "starRateThread");
}

export function removeStarRate(user: User, id: string) {
    return updateStarRating(user, id, "removeStarRateThread");
}

function updateStarRating(user: User, id: string, rellOperation: string) {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name, id);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getThreadStarRating(threadId: string): Promise<string[]> {
    return GTX.query("getStarRatingForId", { id: threadId });
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

function getUsers(inputText: string): Set<string> {
    const regex = /(?:^|\s)(?:@)([a-zA-Z\d]+)/gm;
    const matches = new Set<string>();
    let match;

    while ((match = regex.exec(inputText))) {
        matches.add(match[1]);
    }

    return matches;
}
