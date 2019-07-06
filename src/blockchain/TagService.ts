import {User} from "../types";
import {decrypt, generatePublicKey, toBuffer} from "./CryptoService";
import {GTX, PRIV_KEY} from "./Postchain";
import {sortByFrequency} from "../util/util";


export function storeTagsFromThread(user: User, threadId: string, tags: string[]) {
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createThreadTag", user.name, tags, threadId);
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
