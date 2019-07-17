import {User} from "../types";
import {seedToKey} from "./CryptoService";
import {GTX} from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { uniqueId } from "../util/util";

const boomerang = BoomerangCache.create("following-bucket", {storage: "local", encrypt: true});

export function createFollowing(user: User, following: string) {
    return updateFollowing(user, following, "createFollowing");
}

export function removeFollowing(user: User, following: string) {
    return updateFollowing(user, following, "removeFollowing");
}

function updateFollowing(user: User, following: string, rellOperation: string) {
    boomerang.remove("user-" + user.name);

    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name, following);
    tx.addOperation('nop', uniqueId());
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
