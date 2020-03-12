import { UserSettings } from "../types";
import { executeOperations, executeQuery } from "./Postchain";
import { ChromunityUser } from "../types";
import * as BoomerangCache from "boomerang-cache";
import { toLowerCase } from "../util/util";
import { nop, op } from "ft3-lib";

const boomerang = BoomerangCache.create("users-bucket", {
  storage: "session",
  encrypt: false
});

export function isRegistered(name: string): Promise<boolean> {
  const query = "get_user";

  return executeQuery(query, { name: toLowerCase(name) })
    .then((any: unknown) => {
      return any != null;
    })
    .catch(() => {
      return false;
    });
}

export function getUsernameByAccountId(id: string): Promise<string> {
  return executeQuery("username_by_account_id", { id });
}

export function getUserSettings(user: ChromunityUser): Promise<UserSettings> {
  const query = "get_user_settings";

  return executeQuery(query, { name: toLowerCase(user.name) });
}

export function getUserSettingsCached(name: string, cacheDuration: number): Promise<UserSettings> {
  const userLC: string = toLowerCase(name);
  const cachedAvatar: UserSettings = boomerang.get(userLC);

  if (cachedAvatar != null) {
    return new Promise<UserSettings>(resolve => resolve(cachedAvatar));
  }

  const query = "get_user_settings";

  return executeQuery(query, { name: userLC }).then((settings: UserSettings) => {
    boomerang.set(userLC, settings, cacheDuration);
    return settings;
  });
}

export function updateUserSettings(user: ChromunityUser, avatar: string, description: string) {
  const userLC: string = toLowerCase(user.name);
  boomerang.remove(userLC);

  const operation = "update_user_settings";
  return executeOperations(user.ft3User, op(operation, userLC, user.ft3User.authDescriptor.id, avatar, description));
}

export function toggleUserDistrust(user: ChromunityUser, name: string, muted: boolean) {
  boomerang.remove("distrusted-users");

  const operation = "toggle_distrust";

  return executeOperations(
    user.ft3User,
    op(operation, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(name), muted ? 1 : 0),
    nop()
  );
}

export function getDistrustedUsers(user: ChromunityUser): Promise<string[]> {
  const distrustedUsers: string[] = boomerang.get("distrusted-users");

  if (distrustedUsers != null) {
    return new Promise<string[]>(resolve => resolve(distrustedUsers));
  }

  const query = "get_distrusted_users";

  return executeQuery(query, { name: toLowerCase(user.name) }).then((users: string[]) => {
    boomerang.set("distrusted-users", users, 86000);
    return users;
  });
}

export function getTimesUserWasDistrusted(name: string) {
  return executeQuery("times_user_was_distrusted", { name });
}

export function getTimesUserDistrustedSomeone(name: string) {
  return executeQuery("times_user_distrusted_someone", { name });
}
