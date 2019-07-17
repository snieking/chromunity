import * as bip39 from "bip39";
import { register, login } from "../src/blockchain/UserService";
import { User, Topic } from "../src/types";
import { getTrendingTags } from "../src/blockchain/TagService";
import { getANumber, sleepUntil } from "./helper";
import { getTopicsByUserPriorToTimestamp, getTopicsByTagPriorToTimestamp, createTopic } from "../src/blockchain/TopicService";

jest.setTimeout(60000);

describe("thread tagging tests", () => {

    const user = {
        name: "anastasia_" + getANumber(),
        password: "nastya",
        mnemonic: bip39.generateMnemonic(160)
    }

    var loggedInUser: User;

    it("register and login user to use", async () => {
        await register(user.name, user.password, user.mnemonic);
        loggedInUser = await login(user.name, user.password, user.mnemonic);
    });

    it("create thread with tag", async () => {
        const title: string = "Message with tag inside"
        await createTopic(loggedInUser, title, "Hello #world");
        sleepUntil(Date.now() + 20000);
        const topics: Topic[] = await getTopicsByTagPriorToTimestamp("world", Date.now() + 3000);
        expect(topics.length).toBe(1);

        const trendingTags: string[] = await getTrendingTags(1);
        expect(trendingTags.length).toBe(1);
    });

});