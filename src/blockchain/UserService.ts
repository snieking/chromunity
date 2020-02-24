import { UserMeta, UserSettings } from "../types";
import { executeOperations, executeQuery } from "./Postchain";
import { ChromunityUser } from "../types";
import * as BoomerangCache from "boomerang-cache";
import { toLowerCase } from "../util/util";
import { op } from "ft3-lib";

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

export function getAccountId(username: string): Promise<string> {
  return executeQuery("get_account_id", { name: toLowerCase(username) });
}

export function getUsernameByAccountId(id: string): Promise<string> {
  return executeQuery("username_by_account_id", { id });
}

export function getAccountIdByAuthDescriptor(auth_descriptor: any[]): Promise<string> {
  return executeQuery("ft3.get_account_by_auth_descriptor", { auth_descriptor });
}

export function getUserMeta(username: string): Promise<UserMeta> {
  const query = "get_user_meta";
  return executeQuery(query, { name: toLowerCase(username) });
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
  return executeOperations(
    user.ft3User,
    op(operation, userLC, user.ft3User.authDescriptor.id, avatar, description)
  );
}

export function toggleUserMute(user: ChromunityUser, name: string, muted: boolean) {
  boomerang.remove("muted-users");

  const operation = "toggle_mute";

  return executeOperations(
    user.ft3User,
    op(operation, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(name), muted ? 1 : 0)
  );
}

export function getMutedUsers(user: ChromunityUser): Promise<string[]> {
  const mutedUsers: string[] = boomerang.get("muted-users");

  if (mutedUsers != null) {
    return new Promise<string[]>(resolve => resolve(mutedUsers));
  }

  const query = "get_muted_users";

  return executeQuery(query, { username: toLowerCase(user.name) }).then((users: string[]) => {
    boomerang.set("muted-users", users, 86000);
    return users;
  });
}
