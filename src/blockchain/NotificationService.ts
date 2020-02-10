import { executeOperations, executeQuery } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { ChromunityUser, UserNotification } from "../types";
import { toLowerCase, uniqueId } from "../util/util";
import { nop, op } from "ft3-lib";

const boomerang = BoomerangCache.create("notification-bucket", {
  storage: "session",
  encrypt: false
});

export function sendNotifications(fromUser: ChromunityUser, trigger: string, content: string, usernames: string[]) {
  console.log("SENDING NOTIFICATIONS FOR: " + usernames);
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
  );
}

function sendNotificationsInternal(
  fromUser: ChromunityUser,
  id: string,
  trigger: string,
  content: string,
  usernames: string[]
) {
  const operation = "create_notifications_for_users";

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
  );
}

export function markNotificationsRead(user: ChromunityUser) {
  boomerang.remove("notis-" + user.name.toLocaleLowerCase());
  const epochSeconds = Math.round(new Date().getTime() / 1000);

  const operation = "mark_notifications_since_timestamp_read";

  return executeOperations(
    user.ft3User,
    op(operation, toLowerCase(user.name), user.ft3User.authDescriptor.id, epochSeconds),
    nop()
  );
}

export function getUserNotificationsPriorToTimestamp(
  user: string,
  timestamp: number,
  pageSize: number
): Promise<UserNotification[]> {
  const query = "get_user_notifications_prior_to_timestamp";
  return executeQuery(query, { name: toLowerCase(user), timestamp, page_size: pageSize });
}

export function countUnreadUserNotifications(user: string): Promise<number> {
  const count = boomerang.get("notis-" + user.toLocaleLowerCase());

  if (count == null) {
    const query = "count_unread_user_notifications";
    return executeQuery(query, { name: toLowerCase(user) }).then((arr: unknown[]) => {
      boomerang.set("notis-" + user, arr.length, 60);
      return arr.length;
    });
  } else {
    return new Promise<number>(resolve => resolve(count));
  }
}
