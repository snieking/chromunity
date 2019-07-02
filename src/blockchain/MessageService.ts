import {GTX, PRIV_KEY} from "./Postchain";
import {generatePublicKey, toBuffer, decrypt} from "./CryptoService";
import {uniqueId} from "../util/util";
import {Thread, User} from "../types";
import * as BoomerangCache from "boomerang-cache";
import {storeTagsFromThread} from "./TagService";
import {sendUserNotifications} from "./NotificationService";

const boomerang = BoomerangCache.create('message-bucket', {storage: 'local', encrypt: true});

export function createThread(user: User, message: string): Promise<any> {
    boomerang.remove("threads");
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const threadId = uniqueId();

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation('create_thread', user.name, threadId, "", message);
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

export function createSubThread(user: User, rootThreadId: string, message: string) {
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);

    const threadId = uniqueId();
    tx.addOperation('create_thread', user.name, threadId, rootThreadId, message);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation().then(() => {
        const tags = getHashTags(message);
        if (tags != null) {
            storeTagsFromThread(user, threadId, tags);
        }

        const users = getUsers(message);

        if (users != null) {
            sendUserNotifications(user, threadId, users);
        }
    });
}

export function getAllThreads(): Promise<Thread[]> {
    console.log("Running getAllThreads");

    const cachedThreads = boomerang.get("threads");
    if (cachedThreads != null) {
        return new Promise<Thread[]>(resolve => resolve(cachedThreads));
    } else {
        return GTX.query("get_all_threads", {})
            .then((threads: Thread[]) => {
                boomerang.set("threads", threads, 60);
                threads.forEach(thread => boomerang.set(thread.id, thread));
                return threads;
            });
    }
}

export function getThreadsByUserId(userId: string): Promise<Thread[]> {
    console.log("Running getAllThreads");
    return GTX.query("get_threads_by_user_id", {name: userId});
}

export function getThreadById(threadId: string): Promise<Thread> {
    console.log("Running getThreadById: ", threadId);
    const thread: Thread = boomerang.get(threadId);

    if (thread != null) {
        return new Promise<Thread>(resolve => resolve(thread));
    } else {
        return GTX.query("get_thread_by_id", {id: threadId});
    }
}

export function getSubThreadsByParentId(rootThreadId: string): Promise<Thread[]> {
    console.log("Running getSubThreadsByParentId: ", rootThreadId);
    return GTX.query("get_sub_threads", {root_thread_id: rootThreadId});
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

function getUsers(inputText: string): string[] {
    const regex = /(?:^|\s)(?:@)([a-zA-Z\d]+)/gm;
    const matches = [];
    let match;

    while ((match = regex.exec(inputText))) {
        matches.push(match[1]);
    }

    return matches;
}

export function getThreadsByTag(tag: string): Promise<Thread[]> {
    console.log("Running getThreadsByTag: ", tag);
    return GTX.query("get_threads_by_tag", {tag: tag});
}

export function starRate(user: User, id: string) {
    console.log("Running rateStar: ", user.encryptedKey, id);
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation('star_rate_thread', user.name, id);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function removeStarRate(user: User, id: string) {
    console.log("Running removeStarRating: ", user.encryptedKey, id);
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation('remove_star_rate_thread', user.name, id);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation().catch(console.log);
}

export function getThreadStarRating(threadId: string): Promise<string[]> {
    console.log("Running getThreadStarRating: ", threadId);
    return GTX.query("get_star_rating_for_id", {id: threadId});
}
