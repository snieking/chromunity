import * as bip39 from "bip39";
import { register, login } from "../src/blockchain/UserService";
import { User, Topic } from "../src/types";
import { getTrendingChannels, followChannel, unfollowChannel, getFollowedChannels, getTopicChannelBelongings, countChannelFollowers } from "../src/blockchain/ChannelService";
import { getANumber } from "./helper";
import { getTopicsByChannelPriorToTimestamp, createTopic, getTopicsFromFollowedChannelsPriorToTimestamp, getTopicsByChannelAfterTimestamp, countTopicsInChannel, getTopicsByChannelSortedByPopularityAfterTimestamp } from "../src/blockchain/TopicService";

jest.setTimeout(60000);

describe("channel tests", () => {

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

    it("retrieve topics by channels queries", async () => {
        const title: string = "Chromia";
        const channel: string = "welcome";

        const timestampPriorToCreation: number = Date.now();
        await createTopic(loggedInUser, channel, title, "Hello chromia");

        var topics: Topic[] = await getTopicsByChannelAfterTimestamp(channel, timestampPriorToCreation - 10000);
        expect(topics.length).toBeGreaterThanOrEqual(1);
        const topic: Topic = topics[0];

        const belongings: string[] = await getTopicChannelBelongings(topic.id);
        expect(belongings.length).toBe(1);

        const countOfTopics = await countTopicsInChannel(channel);
        expect(countOfTopics).toBe(1);

        topics = await getTopicsByChannelPriorToTimestamp(channel, Date.now() + 3000, 10);
        expect(topics.length).toBe(1);

        const trendingChannels: string[] = await getTrendingChannels(1);
        expect(trendingChannels.length).toBeGreaterThanOrEqual(1);

        await followChannel(loggedInUser, channel);
        var topicsWithFollowedChannel: Topic[] = await getTopicsFromFollowedChannelsPriorToTimestamp(loggedInUser, Date.now() + 3000, 10);
        var followedChannels: string[] = await getFollowedChannels(loggedInUser.name);
        expect(topicsWithFollowedChannel.length).toBe(1);
        expect(followedChannels.length).toBe(1);

        const topicsByChannelPopularity: Topic[] = await getTopicsByChannelSortedByPopularityAfterTimestamp(channel, 0, 10);
        expect(topicsByChannelPopularity.length).toBe(1);

        const countOfFollowers = await countChannelFollowers(channel);
        expect(countOfFollowers).toBe(1);

        await unfollowChannel(loggedInUser, channel);
        topicsWithFollowedChannel = await getTopicsFromFollowedChannelsPriorToTimestamp(loggedInUser, Date.now() + 3000, 10);
        followedChannels = await getFollowedChannels(loggedInUser.name);
        expect(topicsWithFollowedChannel.length).toBe(0);
        expect(followedChannels.length).toBe(0);
    });

});