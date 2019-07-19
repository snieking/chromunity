import { User } from "../types";
import { seedToKey } from "./CryptoService";
import { GTX } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { uniqueId } from "../util/util";
import { sendNotificationWithDeterministicId, removeNotificationsForId } from "./NotificationService";

const boomerang = BoomerangCache.create("following-bucket", { storage: "local", encrypt: true });

export function createFollowing(user: User, following: string) {
    return updateFollowing(user, following, "createFollowing")
        .then((response: any) => {
            const id: string = createDeterministicId(user.name, following);
            const trigger: string = createFollowingNotificationTrigger(user.name);

            sendNotificationWithDeterministicId(user, id, trigger, "", [ following ])

            return response;
        });
}

export function removeFollowing(user: User, following: string) {
    return updateFollowing(user, following, "removeFollowing")
        .then((response: any) => {
            removeNotificationsForId(user, createDeterministicId(user.name, following), [ following ]);
            return response;
        });
}

function createFollowingNotificationTrigger(username: string): string {
    return "@" + username + " is now following you";
}

function createDeterministicId(follower: string, following: string) {
    return follower + ":" + following;
}

function updateFollowing(user: User, following: string, rellOperation: string) {
    boomerang.remove("user-" + user.name);

    const { privKey, pubKey } = seedToKey(user.seed);

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
