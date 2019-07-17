import {User} from "../types";
import {seedToKey} from "./CryptoService";
import {GTX} from "./Postchain";
import {sortByFrequency} from "../util/util";


export function storeTagsFromThread(user: User, threadId: string, tags: string[]) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createThreadTag", user.name, tags, threadId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function storeTagsFromTopic(user: User, topicId: string, tags: string[]) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createTopicTag", user.name, tags, topicId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getTrendingTags(sinceDaysAgo: number): Promise<string[]> {
    const date: Date = new Date();
    const pastDate: number = date.getDate() - sinceDaysAgo;
    date.setDate(pastDate);

    return GTX.query("getTagsSince", { timestamp: date.getTime() / 1000 })
        .then((tags: string[]) => sortByFrequency(tags).slice(0, 10));
}
