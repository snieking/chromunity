import { getANumber } from "./helper";

import * as bip39 from "bip39";
import { register, login } from "../src/blockchain/UserService";
import { User, Thread } from "../src/types";
import { createFollowing, countUserFollowers, countUserFollowings, amIAFollowerOf, removeFollowing } from "../src/blockchain/FollowingService";

jest.setTimeout(30000);

describe("following tests", () => {

    const user1 = {
        name: "riccardo_" + getANumber(),
        password: "nastya",
        mnemonic: bip39.generateMnemonic(160)
    }

    const user2 = {
        name: "henrik_" + getANumber(),
        password: "nastya",
        mnemonic: bip39.generateMnemonic(160)
    }

    var loggedInUser: User;
    var loggedInUser2: User;

    it("register and login user to use", async () => {
        await register(user1.name, user1.password, user1.mnemonic);
        loggedInUser = await login(user1.name, user1.password, user1.mnemonic);
    });

    it("register and login second user to use", async () => {
        await register(user2.name, user2.password, user2.mnemonic);
        loggedInUser2 = await login(user2.name, user2.password, user2.mnemonic);
    });

    it("user follow another user", async () => {
        await createFollowing(loggedInUser, loggedInUser2.name);
        const followers: number = await countUserFollowers(loggedInUser2.name);
        expect(followers).toBe(1);

        const followings: number = await countUserFollowings(loggedInUser.name);
        expect(followings).toBe(1);

        expect(await amIAFollowerOf(loggedInUser, loggedInUser2.name)).toBe(true);

        await removeFollowing(loggedInUser, loggedInUser2.name);
        expect(await amIAFollowerOf(loggedInUser, loggedInUser2.name)).toBe(false);
    });

});