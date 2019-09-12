import { BLOCKCHAIN, GTX } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { ChromunityUser, UserNotification } from "../types";
import { createStopwatchStarted, handleGADuringException, stopStopwatch, uniqueId } from "../util/util";
import { gaRellOperationTiming, gaRellQueryTiming } from "../GoogleAnalytics";

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
  const operation = "remove_notifications_for_users";
  const sw = createStopwatchStarted();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      fromUser.ft3User,
      operation,
      fromUser.name.toLocaleLowerCase(),
      fromUser.ft3User.authDescriptor.hash().toString("hex"),
      id,
      usernames.map(name => name.toLocaleLowerCase())
    )
  ).then(value => {
    gaRellOperationTiming(operation, stopStopwatch(sw));
    return value;
  }).catch((error: Error) => handleGADuringException(operation, sw, error));
}

function sendNotificationsInternal(
  fromUser: ChromunityUser,
  id: string,
  trigger: string,
  content: string,
  usernames: string[]
) {
  const operation = "create_notifications_for_users";
  const sw = createStopwatchStarted();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      fromUser.ft3User,
      operation,
      fromUser.name.toLocaleLowerCase(),
      fromUser.ft3User.authDescriptor.hash().toString("hex"),
      id,
      trigger,
      content,
      usernames.map(name => name.toLocaleLowerCase())
    )
  ).then(value => {
    gaRellOperationTiming(operation, stopStopwatch(sw));
    return value;
  }).catch((error: Error) => handleGADuringException(operation, sw, error));
}

export function markNotificationsRead(user: ChromunityUser) {
  boomerang.remove("notis-" + user.name.toLocaleLowerCase());
  const epochSeconds = Math.round(new Date().getTime() / 1000);

  const operation = "mark_notifications_since_timestamp_read";
  const sw = createStopwatchStarted();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      operation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      epochSeconds
    )
  ).then(value => {
    gaRellOperationTiming(operation, stopStopwatch(sw));
    return value;
  }).catch((error: Error) => handleGADuringException(operation, sw, error));
}

export function getUserNotificationsPriorToTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<UserNotification[]> {
  const query = "get_user_notifications_prior_to_timestamp";
  const sw = createStopwatchStarted();

  return GTX.query(query, {
    name: user.toLocaleLowerCase(),
    timestamp: timestamp,
    page_size: pageSize
  }).then((userNotifications: UserNotification[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return userNotifications;
  }).catch((error: Error) => handleGADuringException(query, sw, error));
}

export function countUnreadUserNotifications(user: string): Promise<number> {
  const count = boomerang.get("notis-" + user.toLocaleLowerCase());

  if (count == null) {
    const query = "count_unread_user_notifications";
    const sw = createStopwatchStarted();
    return GTX.query(query, {
      name: user.toLocaleLowerCase()
    }).then((arr: unknown[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      boomerang.set("notis-" + user, arr.length, 60);
      return arr.length;
    }).catch((error: Error) => handleGADuringException(query, sw, error));
  } else {
    return new Promise<number>(resolve => resolve(count));
  }
}
