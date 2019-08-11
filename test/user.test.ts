import {UserSettings} from './../src/types';
import {
    getMutedUsers,
    getUserSettings,
    getUserSettingsCached,
    isRegistered,
    login,
    register, toggleUserMute,
    updateUserSettings
} from "../src/blockchain/UserService";
import {getANumber} from "./helper";


import * as bip39 from "bip39";
import {User} from "../src/types";
import {seedFromMnemonic} from "../src/blockchain/CryptoService";

jest.setTimeout(30000);


describe('User tests', () => {

    const user01 = {
        name: "User01_" + getANumber(),
        password: "userPSW1",
        mnemonic: bip39.generateMnemonic(160)
    };

    const user02 = {
        name: "User02_" + getANumber(),
        password: "userPSW1",
        mnemonic: bip39.generateMnemonic(160)
    };

    let loggedInUser: User;
    let secondUser: User;

    it("register user " + user01.name, async () => {
        await expect(register(user01.name, user01.password, user01.mnemonic)).resolves.toBe(null);
        console.log("Registered", user01.name, " with mnemonic", user01.mnemonic);
        expect(await isRegistered(user01.name)).toBe(true);

        await expect(register(user02.name, user02.password, user02.mnemonic)).resolves.toBe(null);
        console.log("Registered", user02.name, " with mnemonic", user02.mnemonic);
        expect(await isRegistered(user02.name)).toBe(true);
    });

    it("login users", async () => {
        const user: User = await login(user01.name, user01.password, seedFromMnemonic(user01.mnemonic, user01.password));
        loggedInUser = user;

        expect(user).toBeDefined();
        expect(user.name).toBe(user01.name);
        expect(user.seed).toBeDefined();

        secondUser = await login(user02.name, user02.password, seedFromMnemonic(user02.mnemonic, user02.password));
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
        mutedUsers = await getMutedUsers(loggedInUser)
        expect(mutedUsers.length).toBe(1);

        await toggleUserMute(loggedInUser, secondUser.name, false);
        mutedUsers = await getMutedUsers(loggedInUser);
        expect(mutedUsers.length).toBe(0);
    });

});
