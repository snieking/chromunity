import { ChromunityUser } from "../types";
import { GTX } from "./Postchain";
import * as BoomerangCache from "boomerang-cache";
import {
  removeNotificationsForId,
  sendNotificationWithDeterministicId
} from "./NotificationService";

const boomerang = BoomerangCache.create("following-bucket", {
  storage: "session",
  encrypt: false
});

export function createFollowing(user: ChromunityUser, following: string) {
  return updateFollowing(user, following, "create_following").then(
    (response: unknown) => {
      const id: string = createDeterministicId(user.name, following);
      const trigger: string = createFollowingNotificationTrigger(user.name);

      sendNotificationWithDeterministicId(user, id, trigger, "", [
        following.toLocaleLowerCase()
      ]);

      return response;
    }
  );
}

export function removeFollowing(user: ChromunityUser, following: string) {
  return updateFollowing(user, following, "remove_following").then(
    (response: unknown) => {
      removeNotificationsForId(
        user,
        createDeterministicId(user.name, following),
        [following.toLocaleLowerCase()]
      );
      return response;
    }
  );
}

function createFollowingNotificationTrigger(username: string): string {
  return "@" + username + " is now following you";
}

function createDeterministicId(follower: string, following: string) {
  return follower.toLocaleLowerCase() + ":" + following.toLocaleLowerCase();
}

function updateFollowing(
  user: ChromunityUser,
  following: string,
  rellOperation: string
) {
  boomerang.remove("user-" + user.name.toLocaleLowerCase());
  return user.bcSession.call(
    rellOperation,
    user.name.toLocaleLowerCase(),
    following.toLocaleLowerCase()
  );
}

export function countUserFollowers(name: string): Promise<number> {
  return GTX.query("get_user_followers", {
    name: name.toLocaleLowerCase()
  }).then((arr: string[]) => arr.length);
}

export function countUserFollowings(name: string): Promise<number> {
  return GTX.query("get_user_follows", { name: name.toLocaleLowerCase() }).then(
    (arr: string[]) => arr.length
  );
}

export function amIAFollowerOf(
  user: ChromunityUser,
  name: string
): Promise<boolean> {
  const userFollows: string[] = boomerang.get(
    "user-" + user.name.toLocaleLowerCase()
  );

  if (userFollows != null) {
    return new Promise<boolean>(resolve =>
      resolve(userFollows.includes(name.toLocaleLowerCase()))
    );
  }

  return GTX.query("get_user_follows", {
    name: user.name.toLocaleLowerCase()
  }).then((userFollows: string[]) => {
    boomerang.set(
      "user-" + user.name.toLocaleLowerCase(),
      userFollows.map(name => name.toLocaleLowerCase())
    );
    return userFollows.includes(name.toLocaleLowerCase());
  });
}
