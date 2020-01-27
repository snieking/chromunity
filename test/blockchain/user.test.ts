import { UserSettings } from "../../src/types";
import {
  getMutedUsers,
  getUserSettings,
  getUserSettingsCached,
  toggleUserMute,
  updateUserSettings
} from "../../src/blockchain/UserService";

import { ChromunityUser } from "../../src/types";
import { CREATE_LOGGED_IN_USER, GET_LOGGED_IN_ADMIN_USER } from "../users";

jest.setTimeout(30000);

describe("User tests", () => {
  let loggedInUser: ChromunityUser;
  let secondUser: ChromunityUser;

  it("Create user with expected mnemonic phrase", async () => {
    const user = await GET_LOGGED_IN_ADMIN_USER();
    expect(user.name).toBe("snieking");
  });

  it("account users", async () => {
    loggedInUser = await CREATE_LOGGED_IN_USER();
    expect(loggedInUser).toBeDefined();

    secondUser = await CREATE_LOGGED_IN_USER();
    expect(secondUser).toBeDefined();
  });

  it("user settings test", async () => {
    var userSettings: UserSettings = await getUserSettings(loggedInUser);
    expect(userSettings).toBeDefined();

    userSettings = await getUserSettings(loggedInUser);
    expect(userSettings.avatar).toBe("");
    expect(userSettings.description).toBe("");

    await updateUserSettings(loggedInUser, "BB==", "Description");
    userSettings = await getUserSettings(loggedInUser);
    expect(userSettings.avatar).toBe("BB==");
    expect(userSettings.description).toBe("Description");

    const settings: UserSettings = await getUserSettingsCached(loggedInUser.name, 0);
    expect(settings.avatar).toBe("BB==");
    expect(settings.description).toBe("Description");
  });

  it("mute and unmute user", async () => {
    let mutedUsers: string[] = await getMutedUsers(loggedInUser);
    expect(mutedUsers.length).toBe(0);

    await toggleUserMute(loggedInUser, secondUser.name, true);
    mutedUsers = await getMutedUsers(loggedInUser);
    expect(mutedUsers.length).toBe(1);

    await toggleUserMute(loggedInUser, secondUser.name, false);
    mutedUsers = await getMutedUsers(loggedInUser);
    expect(mutedUsers.length).toBe(0);
  });
});
