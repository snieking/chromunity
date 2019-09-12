import { ChromunityUser } from "../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { removeNotificationsForId, sendNotificationWithDeterministicId } from "./NotificationService";
import { gaRellOperationTiming, gaRellQueryTiming, gaSocialEvent } from "../GoogleAnalytics";
import { createStopwatchStarted, handleGADuringException, stopStopwatch } from "../util/util";

const boomerang = BoomerangCache.create("following-bucket", {
  storage: "session",
  encrypt: false
});

export function createFollowing(user: ChromunityUser, following: string) {
  return updateFollowing(user, following, "create_following").then((response: unknown) => {
    const id: string = createDeterministicId(user.name, following);
    const trigger: string = createFollowingNotificationTrigger(user.name);

    sendNotificationWithDeterministicId(user, id, trigger, "", [following.toLocaleLowerCase()]);

    return response;
  });
}

export function removeFollowing(user: ChromunityUser, following: string) {
  return updateFollowing(user, following, "remove_following").then((response: unknown) => {
    removeNotificationsForId(user, createDeterministicId(user.name, following), [following.toLocaleLowerCase()]);
    return response;
  });
}

function createFollowingNotificationTrigger(username: string): string {
  return "@" + username + " is now following you";
}

function createDeterministicId(follower: string, following: string) {
  return follower.toLocaleLowerCase() + ":" + following.toLocaleLowerCase();
}

function updateFollowing(user: ChromunityUser, following: string, rellOperation: string) {
  boomerang.remove("user-" + user.name.toLocaleLowerCase());
  gaSocialEvent(rellOperation, following);
  const sw = createStopwatchStarted();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      following.toLocaleLowerCase()
    )
  ).then(value => {
    gaRellOperationTiming(rellOperation, stopStopwatch(sw));
    return value;
  }).catch((error: Error) => handleGADuringException(rellOperation, sw, error));
}

export function countUserFollowers(name: string): Promise<number> {
  const query = "get_user_followers";
  const sw = createStopwatchStarted();

  return GTX.query(query, {
    name: name.toLocaleLowerCase()
  }).then((arr: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return arr.length;
  }).catch((error: Error) => handleGADuringException(query, sw, error));
}

export function countUserFollowings(name: string): Promise<number> {
  const query = "get_user_follows";
  const sw = createStopwatchStarted();

  return GTX.query(query, { name: name.toLocaleLowerCase() }).then((arr: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    return arr.length;
  });
}

export function amIAFollowerOf(user: ChromunityUser, name: string): Promise<boolean> {
  const userFollows: string[] = boomerang.get("user-" + user.name.toLocaleLowerCase());

  if (userFollows != null) {
    return new Promise<boolean>(resolve => resolve(userFollows.includes(name.toLocaleLowerCase())));
  }

  const query = "get_user_follows";
  const sw = createStopwatchStarted();

  return GTX.query(query, {
    name: user.name.toLocaleLowerCase()
  }).then((userFollows: string[]) => {
    gaRellQueryTiming(query, stopStopwatch(sw));
    boomerang.set("user-" + user.name.toLocaleLowerCase(), userFollows.map(name => name.toLocaleLowerCase()));
    return userFollows.includes(name.toLocaleLowerCase());
  }).catch((error: Error) => handleGADuringException(query, sw, error));
}
