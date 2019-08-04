import {getANumber} from "./helper";

import * as bip39 from "bip39";
import {login, register} from "../src/blockchain/UserService";
import {Topic, User} from "../src/types";
import {
    amIAFollowerOf,
    countUserFollowers,
    countUserFollowings,
    createFollowing,
    removeFollowing
} from "../src/blockchain/FollowingService";
import {
    createTopic,
    getTopicsByFollowsSortedByPopularityAfterTimestamp,
    getTopicsFromFollowsAfterTimestamp,
    getTopicsFromFollowsPriorToTimestamp
} from "../src/blockchain/TopicService";

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

        const title: string = "Message to my followers";
        const message: string = "This message is perhaps only of interest to my followers";
        await createTopic(loggedInUser2, "FollowTests", title, message);

        const followingsTopics: Topic[] = await getTopicsFromFollowsPriorToTimestamp(loggedInUser, Date.now(), 10);
        expect(followingsTopics.length).toBe(1);

        const followingsTopics2: Topic[] = await getTopicsFromFollowsAfterTimestamp(loggedInUser, Date.now() - 20000, 10);
        expect(followingsTopics2.length).toBe(1);

        const followingTopics3: Topic[] = await getTopicsByFollowsSortedByPopularityAfterTimestamp(loggedInUser.name, 0, 10);
        expect(followingsTopics2.length).toBe(1);

        await removeFollowing(loggedInUser, loggedInUser2.name);
        expect(await amIAFollowerOf(loggedInUser, loggedInUser2.name)).toBe(false);
    });

});