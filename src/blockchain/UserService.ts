import { UserMeta, UserSettings } from "./../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import { seedFromMnemonic, seedToKey } from "./CryptoService";
import { ChromunityUser } from "../types";
import * as BoomerangCache from "boomerang-cache";

const boomerang = BoomerangCache.create("avatar-bucket", {
  storage: "local",
  encrypt: false
});

export function register(name: string, password: string, mnemonic: string) {
  const seed = seedFromMnemonic(mnemonic, password);
  const { privKey, pubKey } = seedToKey(seed);

  const tx = GTX.newTransaction([pubKey]);
  tx.addOperation("register_user", name.toLocaleLowerCase(), name, pubKey);
  tx.sign(privKey, pubKey);
  return tx.postAndWaitConfirmation();
}

export function isRegistered(name: string): Promise<boolean> {
  return GTX.query("get_user", { name: name.toLocaleLowerCase() })
    .then((any: unknown) => any != null)
    .catch(false);
}

export function getAccountId(username: string): Promise<string> {
  return BLOCKCHAIN.then(bc => bc.query("get_account_id", { name: username }));
}

export function getUserMeta(username: string): Promise<UserMeta> {
  return GTX.query("get_user_meta", { name: username.toLocaleLowerCase() });
}

export function getUserSettings(user: ChromunityUser): Promise<UserSettings> {
  return GTX.query("get_user_settings", {
    name: user.name.toLocaleLowerCase()
  });
}

export function getUserSettingsCached(
  name: string,
  cacheDuration: number
): Promise<UserSettings> {
  const userLC: string = name.toLocaleLowerCase();
  const cachedAvatar: UserSettings = boomerang.get(userLC);

  if (cachedAvatar != null) {
    return new Promise<UserSettings>(resolve => resolve(cachedAvatar));
  }

  return GTX.query("get_user_settings", { name: userLC }).then(
    (settings: UserSettings) => {
      boomerang.set(userLC, settings, cacheDuration);
      return settings;
    }
  );
}

export function updateUserSettings(
  user: ChromunityUser,
  avatar: string,
  description: string
) {
  const userLC: string = user.name.toLocaleLowerCase();
  boomerang.remove(userLC);

  return user.bcSession.call(
    "update_user_settings",
    userLC,
    avatar,
    description
  );
}

export function toggleUserMute(
  user: ChromunityUser,
  name: string,
  muted: boolean
) {
  boomerang.remove("muted-users");
  return user.bcSession.call(
    "toggle_mute",
    user.name.toLocaleLowerCase(),
    name.toLocaleLowerCase(),
    muted ? 1 : 0
  );
}

export function getMutedUsers(user: ChromunityUser): Promise<string[]> {
  const mutedUsers: string[] = boomerang.get("muted-users");

  if (mutedUsers != null) {
    return new Promise<string[]>(resolve => resolve(mutedUsers));
  }

  return GTX.query("get_muted_users", {
    username: user.name.toLocaleLowerCase()
  }).then((users: string[]) => {
    boomerang.set("muted-users", users, 86000);
    return users;
  });
}
