import {UserSettings} from './../src/types';
import {
    getUserSettings,
    getUserSettingsCached,
    isRegistered,
    login,
    register,
    updateUserSettings
} from "../src/blockchain/UserService";
import {getANumber} from "./helper";


import * as bip39 from "bip39";
import {User} from "../src/types";

jest.setTimeout(30000);


describe('User tests', () => {

    const user01 = {
        name: "User01_" + getANumber(),
        password: "userPSW1",
        mnemonic: bip39.generateMnemonic(160)
    };

    var loggedInUser: User;

    it("register user " + user01.name, async () => {
        await expect(register(user01.name, user01.password, user01.mnemonic)).resolves.toBe(null);
        console.log("Registered", user01.name, " with mnemonic", user01.mnemonic);
        expect(await isRegistered(user01.name)).toBe(true);
    });

    it("login user " + user01.name, async () => {
        const user: User = await login(user01.name, user01.password, user01.mnemonic);
        loggedInUser = user;

        expect(user).toBeDefined();
        expect(user.name).toBe(user01.name);
        expect(user.seed).toBeDefined();
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
    })

});
