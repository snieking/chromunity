import * as bip39 from "bip39";
import { register, login } from "../src/blockchain/UserService";
import { User, Topic } from "../src/types";
import { getTrendingTags, storeTagsFromTopic } from "../src/blockchain/TagService";
import { getANumber, sleepUntil } from "./helper";
import { getTopicsByUserPriorToTimestamp, getTopicsByTagPriorToTimestamp, createTopic, getTopicsAfterTimestamp } from "../src/blockchain/TopicService";
import { number } from "prop-types";

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

    it("create topic with tag", async () => {
        const timestamp: number = Date.now();
        const title: string = "Chromia"
        await createTopic(loggedInUser, title, "Hello chromia");
        
        var topics: Topic[] = await getTopicsAfterTimestamp(timestamp-1000);
        expect(topics.length).toBeGreaterThanOrEqual(1);
        const topic: Topic = topics[0];
        await storeTagsFromTopic(loggedInUser, topic.id, ["chromia"])

        topics = await getTopicsByTagPriorToTimestamp("chromia", Date.now() + 3000);
        expect(topics.length).toBe(1);

        const trendingTags: string[] = await getTrendingTags(1);
        expect(trendingTags.length).toBe(1);
    });

});