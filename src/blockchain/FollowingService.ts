import { ChromunityUser } from "../types";
import { executeOperations, executeQuery } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import { removeNotificationsForId, sendNotificationWithDeterministicId } from "./NotificationService";
import { toLowerCase } from "../util/util";
import { nop, op } from "ft3-lib";
import { userEvent } from "../util/matomo";

const boomerang = BoomerangCache.create("following-bucket", {
  storage: "session",
  encrypt: false
});

export function createFollowing(user: ChromunityUser, following: string) {
  userEvent("follow");
  return updateFollowing(user, following, "create_following").then((response: unknown) => {
    const id: string = createDeterministicId(user.name, following);
    const trigger: string = createFollowingNotificationTrigger(user.name);

    sendNotificationWithDeterministicId(user, id, trigger, "", [following.toLocaleLowerCase()]);

    return response;
  });
}

export function removeFollowing(user: ChromunityUser, following: string) {
  userEvent("unfollow");
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

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(following)),
    nop()
  );
}

export function countUserFollowers(name: string): Promise<number> {
  const query = "get_user_followers";

  return executeQuery(query, { name: toLowerCase(name) }).then((arr: string[]) => arr.length);
}

export function countUserFollowings(name: string): Promise<number> {
  const query = "get_user_follows";

  return executeQuery(query, { name: toLowerCase(name) }).then((arr: string[]) => arr.length);
}

export function amIAFollowerOf(user: ChromunityUser, name: string): Promise<boolean> {
  const userFollows: string[] = boomerang.get("user-" + toLowerCase(user.name));

  if (userFollows != null) {
    return new Promise<boolean>(resolve => resolve(userFollows.includes(toLowerCase(name))));
  }

  const query = "get_user_follows";

  return executeQuery(query, { name: toLowerCase(user.name) }).then((userFollows: string[]) => {
    boomerang.set("user-" + toLowerCase(user.name), userFollows.map(name => toLowerCase(name)));
    return userFollows.includes(toLowerCase(name));
  });
}
