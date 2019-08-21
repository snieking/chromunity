import { ChromunityUser, Topic } from "../src/types";
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
import {CREATE_LOGGED_IN_USER} from "./users";

jest.setTimeout(30000);

describe("following tests", () => {

    let loggedInUser: ChromunityUser;
    let loggedInUser2: ChromunityUser;

    beforeAll(async () => {
        loggedInUser = await CREATE_LOGGED_IN_USER();
        loggedInUser2 = await CREATE_LOGGED_IN_USER();
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