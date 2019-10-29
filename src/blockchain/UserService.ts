import { UserMeta, UserSettings } from "../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import { ChromunityUser } from "../types";
import * as BoomerangCache from "boomerang-cache";
import { createStopwatchStarted, stopStopwatch } from "../util/util";
import { gaRellOperationTiming, gaRellQueryTiming } from "../GoogleAnalytics";

const boomerang = BoomerangCache.create("users-bucket", {
  storage: "session",
  encrypt: false
});

export function isRegistered(name: string): Promise<boolean> {
  const query = "get_user";
  const sw = createStopwatchStarted();

  return GTX.query(query, { name: name.toLocaleLowerCase() })
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
  return BLOCKCHAIN.then(bc => bc.query("get_account_id", { name: username }));
}

export function getUserMeta(username: string): Promise<UserMeta> {
  const query = "get_user_meta";
  const sw = createStopwatchStarted();
  return GTX.query(query, { name: username.toLocaleLowerCase() }).then((meta: UserMeta) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return meta;
  });
}

export function getUserSettings(user: ChromunityUser): Promise<UserSettings> {
  const query = "get_user_settings";
  const sw = createStopwatchStarted();

  return GTX.query(query, {
    name: user.name.toLocaleLowerCase()
  }).then((settings: UserSettings) => {
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

  return GTX.query(query, { name: userLC }).then((settings: UserSettings) => {
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

  return BLOCKCHAIN.then(bc =>
    bc.call(user.ft3User, operation, userLC, user.ft3User.authDescriptor.hash().toString("hex"), avatar, description)
  ).then(value => {
    gaRellOperationTiming(operation, stopStopwatch(sw));
    return value;
  });
}

export function toggleUserMute(user: ChromunityUser, name: string, muted: boolean) {
  boomerang.remove("muted-users");

  const operation = "toggle_mute";
  const sw = createStopwatchStarted();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      operation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      name.toLocaleLowerCase(),
      muted ? 1 : 0
    )
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

  return GTX.query(query, {
    username: user.name.toLocaleLowerCase()
  }).then((users: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    boomerang.set("muted-users", users, 86000);
    return users;
  });
}
