import {GTX, PRIV_KEY} from "./Postchain";
import {generatePublicKey, toBuffer, decrypt} from "./CryptoService";
import {uniqueId} from "../util/util";
import {Thread, User} from "../types";
import * as BoomerangCache from "boomerang-cache";

const boomerang = BoomerangCache.create('bucket1', {storage: 'local', encrypt: true});

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
                return storeTagsFromThread(user, threadId, tags);
            } else {
                return promise;
            }
        });
}


export function createSubThread(user: User, parentId: string, message: string) {
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation('create_thread', user.name, uniqueId(), parentId, message);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation().catch(console.log);
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

export function getSubThreadsByParentId(parentId: string): Promise<Thread[]> {
    console.log("Running getSubThreadsByParentId: ", parentId);
    return GTX.query("get_sub_threads", {parent_id: parentId});
}

function storeTagsFromThread(user: User, threadId: string, tags: string[]) {
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation('create_thread_tag', user.name, tags, threadId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();

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
