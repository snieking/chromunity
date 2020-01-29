import { executeOperations, executeQuery } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { ChromunityUser, UserNotification } from "../types";
import { createStopwatchStarted, handleException, stopStopwatch, toLowerCase, uniqueId } from "../util/util";
import { gaRellOperationTiming, gaRellQueryTiming } from "../GoogleAnalytics";
import { nop, op } from "ft3-lib";

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

  return executeOperations(
    fromUser.ft3User,
    op(
      operation,
      toLowerCase(fromUser.name),
      fromUser.ft3User.authDescriptor.id,
      id,
      usernames.map(name => toLowerCase(name))
    ),
    nop()
  )
    .then(value => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(operation, sw, error));
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

  return executeOperations(
    fromUser.ft3User,
    op(
      operation,
      toLowerCase(fromUser.name),
      fromUser.ft3User.authDescriptor.id,
      id,
      trigger,
      content,
      usernames.map(name => toLowerCase(name)).filter(name => name !== fromUser.name)
    ),
    nop()
  )
    .then(value => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(operation, sw, error));
}

export function markNotificationsRead(user: ChromunityUser) {
  boomerang.remove("notis-" + user.name.toLocaleLowerCase());
  const epochSeconds = Math.round(new Date().getTime() / 1000);

  const operation = "mark_notifications_since_timestamp_read";
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(operation, toLowerCase(user.name), user.ft3User.authDescriptor.id, epochSeconds),
    nop()
  )
    .then(value => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(operation, sw, error));
}

export function getUserNotificationsPriorToTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<UserNotification[]> {
  const query = "get_user_notifications_prior_to_timestamp";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: toLowerCase(user), timestamp, page_size: pageSize })
    .then((userNotifications: UserNotification[]) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return userNotifications;
    })
    .catch((error: Error) => handleException(query, sw, error));
}

export function countUnreadUserNotifications(user: string): Promise<number> {
  const count = boomerang.get("notis-" + user.toLocaleLowerCase());

  if (count == null) {
    const query = "count_unread_user_notifications";
    const sw = createStopwatchStarted();
    return executeQuery(query, { name: toLowerCase(user) })
      .then((arr: unknown[]) => {
        gaRellQueryTiming(query, stopStopwatch(sw));
        boomerang.set("notis-" + user, arr.length, 60);
        return arr.length;
      })
      .catch((error: Error) => handleException(query, sw, error));
  } else {
    return new Promise<number>(resolve => resolve(count));
  }
}
