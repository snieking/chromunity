import { ChromunityUser, UserMeta } from "../types";
import * as BoomerangCache from "boomerang-cache";
import { getUserMeta } from "../blockchain/UserService";
import { FlagsType, KeyPair, SingleSignatureAuthDescriptor, User } from "ft3-lib";
import ReactPiwik from "react-piwik";
import * as Sentry from '@sentry/browser';

const LOCAL_CACHE = BoomerangCache.create("local-bucket", {
  storage: "local",
  encrypt: false
});
const ENCRYPTED_LOCAL_CACHE = BoomerangCache.create("encrypted-local-bucket", {
  storage: "local",
  encrypt: true
});
const SESSION_CACHE = BoomerangCache.create("session-bucket", {
  storage: "session",
  encrypt: true
});

const USER_KEY = "user";
const USER_META_KEY = "user_meta";
const KEYPAIR_KEY = "keyPair";
const RSA_PASS = "rsaPassPhrase";

let debugUserSet: boolean = false;

export function clearSession(): void {
  ENCRYPTED_LOCAL_CACHE.clear();
  LOCAL_CACHE.remove(USER_KEY);
  LOCAL_CACHE.remove(KEYPAIR_KEY);
  SESSION_CACHE.remove(USER_META_KEY);
}

export function storeKeyPair(keyPair: KeyPair): void {
  LOCAL_CACHE.set(KEYPAIR_KEY, keyPair);
}

export function getKeyPair(): KeyPair {
  const keyPair = LOCAL_CACHE.get("keyPair");
  if (keyPair == null) return null;
  return new KeyPair(keyPair.privKey);
}

export function storeChatPassphrase(passphrase: string) {
  ENCRYPTED_LOCAL_CACHE.set(RSA_PASS, passphrase);
}

export function getChatPassphrase(): any {
  return ENCRYPTED_LOCAL_CACHE.get(RSA_PASS);
}

export function getUsername(): string {
  const username = LOCAL_CACHE.get(USER_KEY);

  if (username != null && !debugUserSet) {
    try {
      Sentry.configureScope(scope => scope.setUser({"username": username}));
      ReactPiwik.push(['setUserId', username]);
      debugUserSet = true;
    } catch(error) {
      console.log("Error adding username for debug", username, error);
    }
  }

  return username;
}

export function setUsername(username: string): void {
  LOCAL_CACHE.set(USER_KEY, username);
}

export function getUser(): ChromunityUser {
  const keyPair = getKeyPair();
  const username: string = getUsername();

  if (keyPair == null) return null;
  if (username == null) return null;

  const authDescriptor = new SingleSignatureAuthDescriptor(keyPair.pubKey, [FlagsType.Account, FlagsType.Transfer]);
  const ft3User = new User(keyPair, authDescriptor);

  return { name: username, ft3User: ft3User };
}

export function setUserMeta(meta: UserMeta): void {
  SESSION_CACHE.set(USER_META_KEY, meta, 600);
}

export function getCachedUserMeta(): Promise<UserMeta> {
  const meta: UserMeta = SESSION_CACHE.get(USER_META_KEY);

  if (meta != null) {
    return new Promise<UserMeta>(resolve => resolve(meta));
  }

  const username = getUsername();

  if (username != null) {
    return getUserMeta(getUsername()).then(meta => {
      setUserMeta(meta);
      return meta;
    });
  } else {
    return new Promise<UserMeta>(resolve => resolve(null));
  }
}

export function godAlias(): string {
  return "admin";
}

export function isGod(): boolean {
  const username = getUsername();
  return username != null && username === godAlias();
}

export function ifEmptyAvatarThenPlaceholder(avatar: string, seed: string) {
  return avatar !== "" && avatar != null ? avatar : "https://avatars.dicebear.com/v2/gridy/" + seed + ".svg";
}
