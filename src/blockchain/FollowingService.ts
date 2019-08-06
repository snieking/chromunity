import {User} from "../types";
import {seedToKey} from "./CryptoService";
import {GTX} from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import {uniqueId} from "../util/util";
import {removeNotificationsForId, sendNotificationWithDeterministicId} from "./NotificationService";

const boomerang = BoomerangCache.create("following-bucket", {storage: "session", encrypt: false});

export function createFollowing(user: User, following: string) {
    return updateFollowing(user, following, "create_following")
        .then((response: any) => {
            const id: string = createDeterministicId(user.name, following);
            const trigger: string = createFollowingNotificationTrigger(user.name);

            sendNotificationWithDeterministicId(user, id, trigger, "", [following.toLocaleLowerCase()])

            return response;
        });
}

export function removeFollowing(user: User, following: string) {
    return updateFollowing(user, following, "remove_following")
        .then((response: any) => {
            removeNotificationsForId(user, createDeterministicId(user.name, following), [following.toLocaleLowerCase()]);
            return response;
        });
}

function createFollowingNotificationTrigger(username: string): string {
    return "@" + username + " is now following you";
}

function createDeterministicId(follower: string, following: string) {
    return follower.toLocaleLowerCase() + ":" + following.toLocaleLowerCase();
}

function updateFollowing(user: User, following: string, rellOperation: string) {
    boomerang.remove("user-" + user.name.toLocaleLowerCase());

    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation(rellOperation, user.name.toLocaleLowerCase(), following.toLocaleLowerCase());
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function countUserFollowers(name: string): Promise<number> {
    return GTX.query("get_user_followers", {name: name.toLocaleLowerCase()}).then((arr: string[]) => arr.length);
}

export function countUserFollowings(name: string): Promise<number> {
    return GTX.query("get_user_follows", {name: name.toLocaleLowerCase()}).then((arr: string[]) => arr.length);
}

export function amIAFollowerOf(user: User, name: string): Promise<boolean> {
    const userFollows: string[] = boomerang.get("user-" + user.name.toLocaleLowerCase());

    if (userFollows != null) {
        return new Promise<boolean>(resolve => resolve(userFollows.includes(name.toLocaleLowerCase())));
    }

    return GTX.query("get_user_follows", {name: user.name.toLocaleLowerCase()})
        .then((userFollows: string[]) => {
            boomerang.set("user-" + user.name.toLocaleLowerCase(), userFollows.map(name => name.toLocaleLowerCase()));
            return userFollows.includes(name.toLocaleLowerCase());
        });
}
