import {GTX} from "./Postchain";
import {seedToKey} from "./CryptoService";
import * as BoomerangCache from "boomerang-cache";
import {User, UserNotification} from "../types";
import {uniqueId} from "../util/util";

const boomerang = BoomerangCache.create("notification-bucket", {storage: "session", encrypt: false});

export function sendNotifications(fromUser: User, trigger: string, content: string, usernames: string[]) {
    return sendNotificationsInternal(fromUser, uniqueId(), trigger, content, usernames);
}

export function sendNotificationWithDeterministicId(fromUser: User, id: string, trigger: string, content: string, usernames: string[]) {
    return sendNotificationsInternal(fromUser, id, trigger, content, usernames);
}

export function removeNotificationsForId(fromUser: User, id: string, usernames: string[]) {
    const {privKey, pubKey} = seedToKey(fromUser.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("remove_notifications_for_users", fromUser.name.toLocaleLowerCase(), id, usernames.map(name => name.toLocaleLowerCase()));
    tx.addOperation("nop", uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

function sendNotificationsInternal(fromUser: User, id: string, trigger: string, content: string, usernames: string[]) {
    const {privKey, pubKey} = seedToKey(fromUser.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("create_notifications_for_users", fromUser.name.toLocaleLowerCase(), id, trigger, content, usernames.map(name => name.toLocaleLowerCase()));
    tx.addOperation("nop", uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function markNotificationsRead(user: User) {
    boomerang.remove("notis-" + user.name.toLocaleLowerCase());

    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    const epochSeconds = Math.round(new Date().getTime() / 1000);
    tx.addOperation("mark_notifications_since_timestamp_read", user.name.toLocaleLowerCase(), epochSeconds);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getUserNotificationsPriorToTimestamp(user: string, timestamp: number, pageSize: number): Promise<UserNotification[]> {
    return GTX.query("get_user_notifications_prior_to_timestamp", {
        name: user.toLocaleLowerCase(),
        timestamp: timestamp,
        page_size: pageSize
    });
}

export function countUnreadUserNotifications(user: string): Promise<number> {
    const count = boomerang.get("notis-" + user.toLocaleLowerCase());

    if (count == null) {
        return GTX.query('count_unread_user_notifications', {name: user.toLocaleLowerCase()})
            .then((arr: unknown[]) => {
                boomerang.set("notis-" + user, arr.length, 60);
                return arr.length;
            });
    } else {
        return new Promise<number>(resolve => resolve(count));
    }
}
