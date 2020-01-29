import { UserMeta, UserSettings } from "../types";
import { executeOperations, executeQuery } from "./Postchain";
import { ChromunityUser } from "../types";
import * as BoomerangCache from "boomerang-cache";
import { createStopwatchStarted, stopStopwatch, toLowerCase } from "../util/util";
import { gaRellOperationTiming, gaRellQueryTiming } from "../GoogleAnalytics";
import { op } from "ft3-lib";

const boomerang = BoomerangCache.create("users-bucket", {
  storage: "session",
  encrypt: false
});

export function isRegistered(name: string): Promise<boolean> {
  const query = "get_user";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: toLowerCase(name) })
    .then((any: unknown) => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return any != null;
    })
    .catch(() => {
      gaRellQueryTiming(query, stopStopwatch(sw));
      return false;
    });
}

export function getAccountId(username: string): Promise<string> {
  return executeQuery("get_account_id", { name: toLowerCase(username) });
}

export function getUserMeta(username: string): Promise<UserMeta> {
  const query = "get_user_meta";
  const sw = createStopwatchStarted();
  return executeQuery(query, { name: toLowerCase(username) }).then((meta: UserMeta) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return meta;
  });
}

export function getUserSettings(user: ChromunityUser): Promise<UserSettings> {
  const query = "get_user_settings";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: toLowerCase(user.name) }).then((settings: UserSettings) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return settings;
  });
}

export function getUserSettingsCached(name: string, cacheDuration: number): Promise<UserSettings> {
  const userLC: string = name.toLocaleLowerCase();
  const cachedAvatar: UserSettings = boomerang.get(userLC);

  if (cachedAvatar != null) {
    return new Promise<UserSettings>(resolve => resolve(cachedAvatar));
  }

  const query = "get_user_settings";
  const sw = createStopwatchStarted();

  return executeQuery(query, { name: userLC }).then((settings: UserSettings) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    boomerang.set(userLC, settings, cacheDuration);
    return settings;
  });
}

export function updateUserSettings(user: ChromunityUser, avatar: string, description: string) {
  const userLC: string = user.name.toLocaleLowerCase();
  boomerang.remove(userLC);

  const operation = "update_user_settings";
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(operation, userLC, user.ft3User.authDescriptor.id, avatar, description)
  ).then(value => {
    gaRellOperationTiming(operation, stopStopwatch(sw));
    return value;
  });
}

export function toggleUserMute(user: ChromunityUser, name: string, muted: boolean) {
  boomerang.remove("muted-users");

  const operation = "toggle_mute";
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(operation, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(name), muted ? 1 : 0)
  ).then(value => {
    gaRellOperationTiming(operation, stopStopwatch(sw));
    return value;
  });
}

export function getMutedUsers(user: ChromunityUser): Promise<string[]> {
  const mutedUsers: string[] = boomerang.get("muted-users");

  if (mutedUsers != null) {
    return new Promise<string[]>(resolve => resolve(mutedUsers));
  }

  const query = "get_muted_users";
  const sw = createStopwatchStarted();

  return executeQuery(query, { username: toLowerCase(user.name) }).then((users: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    boomerang.set("muted-users", users, 86000);
    return users;
  });
}
