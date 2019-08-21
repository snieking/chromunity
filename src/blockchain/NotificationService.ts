import { BLOCKCHAIN, GTX } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { ChromunityUser, UserNotification } from "../types";
import { uniqueId } from "../util/util";

const boomerang = BoomerangCache.create("notification-bucket", {
  storage: "session",
  encrypt: false
});

export function sendNotifications(fromUser: ChromunityUser, trigger: string, content: string, usernames: string[]) {
  return sendNotificationsInternal(fromUser, uniqueId(), trigger, content, usernames);
}

export function sendNotificationWithDeterministicId(
  fromUser: ChromunityUser,
  id: string,
  trigger: string,
  content: string,
  usernames: string[]
) {
  return sendNotificationsInternal(fromUser, id, trigger, content, usernames);
}

export function removeNotificationsForId(fromUser: ChromunityUser, id: string, usernames: string[]) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      fromUser.ft3User,
      "remove_notifications_for_users",
      fromUser.name.toLocaleLowerCase(),
      id,
      usernames.map(name => name.toLocaleLowerCase())
    )
  );
}

function sendNotificationsInternal(
  fromUser: ChromunityUser,
  id: string,
  trigger: string,
  content: string,
  usernames: string[]
) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      fromUser.ft3User,
      "create_notifications_for_users",
      fromUser.name.toLocaleLowerCase(),
      id,
      trigger,
      content,
      usernames.map(name => name.toLocaleLowerCase())
    )
  );
}

export function markNotificationsRead(user: ChromunityUser) {
  boomerang.remove("notis-" + user.name.toLocaleLowerCase());
  const epochSeconds = Math.round(new Date().getTime() / 1000);

  return BLOCKCHAIN.then(bc =>
    bc.call(user.ft3User, "mark_notifications_since_timestamp_read", user.name.toLocaleLowerCase(), epochSeconds)
  );
}

export function getUserNotificationsPriorToTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<UserNotification[]> {
  return GTX.query("get_user_notifications_prior_to_timestamp", {
    name: user.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  });
}

export function countUnreadUserNotifications(user: string): Promise<number> {
  const count = boomerang.get("notis-" + user.toLocaleLowerCase());

  if (count == null) {
    return GTX.query("count_unread_user_notifications", {
      name: user.toLocaleLowerCase()
    }).then((arr: unknown[]) => {
      boomerang.set("notis-" + user, arr.length, 60);
      return arr.length;
    });
  } else {
    return new Promise<number>(resolve => resolve(count));
  }
}
