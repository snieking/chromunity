import {User} from "../types";
import {decrypt, generatePublicKey, toBuffer} from "./CryptoService";
import {GTX, PRIV_KEY} from "./Postchain";
import * as BoomerangCache from "boomerang-cache";

const boomerang = BoomerangCache.create("following-bucket", {storage: "local", encrypt: true});

export function createFollowing(user: User, following: string) {
    boomerang.remove("user-" + user.name);
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createFollowing", user.name, following);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function removeFollowing(user: User, following: string) {
    boomerang.remove("user-" + user.name);
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("removeFollowing", user.name, following);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function countUserFollowers(name: string): Promise<number> {
    return GTX.query("getUserFollowers", { name: name }).then((arr: string[]) => arr.length);
}

export function countUserFollowings(name: string): Promise<number> {
    return GTX.query("getUserFollows", { name: name }).then((arr: string[]) => arr.length);
}

export function amIAFollowerOf(user: User, name: string): Promise<boolean> {
    const userFollows: string[] = boomerang.get("user-" + user.name);

    if (userFollows != null) {
        return new Promise<boolean>(resolve => resolve(userFollows.includes(name)));
    }

    return GTX.query("getUserFollows", { name: user.name })
        .then((userFollows: string[]) => {
           boomerang.set("user-" + user.name, userFollows);
           return userFollows.includes(name);
        });
}
