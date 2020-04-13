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

const WALL_UPDATED_IN_SESSION = "wallUpdatedInSession";
const WALL_REFRESHED = "wallRefreshed";
const WALL_PREVIOUSLY_REFRESHED = "wallPreviouslyRefreshed";

const TOPIC_READ_PREFIX = "topicRead:";

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

export function markTopicWallRefreshed() {
  const updatedInTheSession = SESSION_CACHE.get(WALL_UPDATED_IN_SESSION);

  if (!updatedInTheSession) {
    const wallLatestRefresh = LOCAL_CACHE.get(WALL_REFRESHED);
    LOCAL_CACHE.set(WALL_PREVIOUSLY_REFRESHED, wallLatestRefresh ? wallLatestRefresh : 0);
    LOCAL_CACHE.set(WALL_REFRESHED, Date.now());
    SESSION_CACHE.set(WALL_UPDATED_IN_SESSION, true, 300);
  }
}

export function getWallPreviouslyRefreshed(): number {
  const prevRefreshed = LOCAL_CACHE.get(WALL_PREVIOUSLY_REFRESHED);
  return prevRefreshed ? prevRefreshed : 0;
}

export function markTopicReadInSession(topicId: string) {
  SESSION_CACHE.set(TOPIC_READ_PREFIX + topicId, true);
}

export function isTopicReadInSession(topicId: string) {
  return SESSION_CACHE.get(TOPIC_READ_PREFIX + topicId) != null;
}

export function getUsername(): string {
  const username = LOCAL_CACHE.get(USER_KEY);
  pushUsernameToMatomo(username);
  return username;
}

export function setUsername(username: string): void {
  LOCAL_CACHE.set(USER_KEY, username);
  pushUsernameToMatomo(username);
}

function pushUsernameToMatomo(username: string) {
  if (Sentry != null && ReactPiwik != null && username != null && !debugUserSet) {
    try {
      Sentry.configureScope(scope => scope.setUser({"username": username}));
      ReactPiwik.push(['setUserId', username]);
      debugUserSet = true;
    } catch(error) {
      logger.error("Error adding username [%s] for debug", username, error);
    }
  }
}

export function ifEmptyAvatarThenPlaceholder(avatar: string, seed: string) {
  return avatar !== "" && avatar != null ? avatar : "https://avatars.dicebear.com/v2/gridy/" + seed + ".svg";
}
