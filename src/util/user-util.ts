import * as BoomerangCache from "boomerang-cache";
import ReactPiwik from "react-piwik";
import * as Sentry from '@sentry/browser';
import logger from "./logger";

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
const RSA_PASS = "rsaPassPhrase";

let debugUserSet: boolean = false;

export function clearSession(): void {
  ENCRYPTED_LOCAL_CACHE.clear();
  LOCAL_CACHE.remove(USER_KEY);
  SESSION_CACHE.remove(USER_META_KEY);
}

export function storeChatPassphrase(passphrase: string) {
  ENCRYPTED_LOCAL_CACHE.set(RSA_PASS, passphrase);
}

export function getChatPassphrase(): any {
  return ENCRYPTED_LOCAL_CACHE.get(RSA_PASS);
}

export function getUsername(): string {
  const username = LOCAL_CACHE.get(USER_KEY);

  if (Sentry != null && ReactPiwik != null && username != null && !debugUserSet) {
    try {
      Sentry.configureScope(scope => scope.setUser({"username": username}));
      ReactPiwik.push(['setUserId', username]);
      debugUserSet = true;
    } catch(error) {
      logger.error("Error adding username [%s] for debug", username, error);
    }
  }

  return username;
}

export function setUsername(username: string): void {
  LOCAL_CACHE.set(USER_KEY, username);
}

export function ifEmptyAvatarThenPlaceholder(avatar: string, seed: string) {
  return avatar !== "" && avatar != null ? avatar : "https://avatars.dicebear.com/v2/gridy/" + seed + ".svg";
}
