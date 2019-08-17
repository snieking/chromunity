import { UserMeta, UserSettings } from "./../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import { seedFromMnemonic, seedToKey } from "./CryptoService";
import { User } from "../types";
import { setUser, setUserMeta } from "../util/user-util";
import * as BoomerangCache from "boomerang-cache";
import { uniqueId } from "../util/util";
import { SingleSignatureAuthDescriptor } from "ft3-lib";

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

export function walletRegister(
  name: string,
  walletAuthDescriptor: SingleSignatureAuthDescriptor,
  authDescriptor: SingleSignatureAuthDescriptor
) {

}

export function login(
  name: string,
  password: string,
  seed: string
): Promise<User> {
  return GTX.query("get_user", { name: name.toLocaleLowerCase() }).then(
    (blockchainUser: BlockchainUser) => {
      const user: User = { name: name, seed: seed };
      setUser(user, password);

      getUserMeta(name).then(meta => setUserMeta(meta));

      return user;
    }
  );
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

export function getUserSettings(user: User): Promise<UserSettings> {
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
  user: User,
  avatar: string,
  description: string
) {
  const userLC: string = user.name.toLocaleLowerCase();
  boomerang.remove(userLC);

  const { privKey, pubKey } = seedToKey(user.seed);

  const tx = GTX.newTransaction([pubKey]);
  tx.addOperation("update_user_settings", userLC, avatar, description);
  tx.addOperation("nop", uniqueId());
  tx.sign(privKey, pubKey);
  return tx.postAndWaitConfirmation();
}

export function toggleUserMute(user: User, name: string, muted: boolean) {
  boomerang.remove("muted-users");
  const { privKey, pubKey } = seedToKey(user.seed);

  const tx = GTX.newTransaction([pubKey]);
  tx.addOperation(
    "toggle_mute",
    user.name.toLocaleLowerCase(),
    name.toLocaleLowerCase(),
    muted ? 1 : 0
  );
  tx.addOperation("nop", uniqueId());
  tx.sign(privKey, pubKey);
  return tx.postAndWaitConfirmation();
}

export function getMutedUsers(user: User): Promise<string[]> {
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

interface BlockchainUser {
  name: string;
  pubkey: string;
  registered: number;
}
