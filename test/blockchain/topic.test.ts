import { ChromunityUser, Topic, TopicReply } from "../../src/types";
import {
    countRepliesByUser,
    countReplyStarRatingForUser,
    countTopicsByUser,
    countTopicStarRatingForUser,
    createTopic,
    createTopicReply,
    createTopicSubReply,
    getAllTopicsByPopularityAfterTimestamp,
    getReplyStarRaters,
    getTopicById,
    getTopicRepliesByUserPriorToTimestamp,
    getTopicRepliesPriorToTimestamp,
    getTopicsAfterTimestamp,
    getTopicsByUserPriorToTimestamp,
    getTopicsPriorToTimestamp,
    getTopicStarRaters,
    getTopicSubReplies,
    getTopicSubscribers,
    giveReplyStarRating,
    giveTopicStarRating,
    modifyReply,
    modifyTopic,
    removeReplyStarRating,
    removeTopicStarRating,
    subscribeToTopic,
    unsubscribeFromTopic
} from '../../src/blockchain/TopicService';
import {CREATE_LOGGED_IN_USER} from "../users";
import {CREATE_RANDOM_TOPIC} from "../topics";

jest.setTimeout(30000);

describe("topic tests", () => {

    const channel: string = "TopicTesting";

    let userLoggedIn: ChromunityUser;
    let secondLoggedInUser: ChromunityUser;
    let topic: Topic;

    beforeAll(async () => {
        userLoggedIn = await CREATE_LOGGED_IN_USER();
        secondLoggedInUser = await CREATE_LOGGED_IN_USER();
        await createTopic(userLoggedIn, channel, 'Second topic', 'Not as good as the first one... #superior');
        const topics: Topic[] = await getTopicsByUserPriorToTimestamp(userLoggedIn.name, Date.now(), 10);
        expect(topics.length).toBeGreaterThanOrEqual(1);
        topic = topics[0];
    });

    it('create topic', async () => {
        await createTopic(userLoggedIn, channel, 'First topic', 'Sweet topic you got there!');
        await createTopic(userLoggedIn, channel, 'Second topic', 'Not as good as the first one... #superior');
        const topics: Topic[] = await getTopicsByUserPriorToTimestamp(userLoggedIn.name, Date.now(), 10);
        expect(topics.length).toBeGreaterThanOrEqual(2);
        topic = topics[0];
    });

    it('create many topics', async() => {
        await Array.from({ length: 50 }).forEach(async () => {
            const user = await CREATE_LOGGED_IN_USER();
            await CREATE_RANDOM_TOPIC(user, "general");
        });
    });

    it("reply to topic and reply to a reply", async () => {
        await createTopicReply(userLoggedIn, topic.id, "I completely agree!");

        const replies: TopicReply[] = await getTopicRepliesPriorToTimestamp(topic.id, Date.now(), 10);
        expect(replies.length).toBe(1);
        const reply: TopicReply = replies[0];

        await giveReplyStarRating(userLoggedIn, reply.id);
        const upvotedBy: string[] = await getReplyStarRaters(reply.id);
        expect(upvotedBy.length).toBe(1);

        await removeReplyStarRating(userLoggedIn, reply.id);
        const upvotedBy2: string[] = await getReplyStarRaters(reply.id);
        expect(upvotedBy2.length).toBe(0);

        await giveReplyStarRating(userLoggedIn, reply.id);
        const upvotedBy3: string[] = await getReplyStarRaters(reply.id);
        expect(upvotedBy3.length).toBe(1);

        await createTopicSubReply(secondLoggedInUser, topic.id, reply.id, "Are you certain?");
        const subReplies: TopicReply[] = await getTopicSubReplies(reply.id);
        expect(subReplies.length).toBe(1);

        const subReply: TopicReply = subReplies[0];
        await createTopicSubReply(userLoggedIn, topic.id, subReply.id, "I am always certain");

        const subSubReplies: TopicReply[] = await getTopicSubReplies(subReply.id);
        expect(subSubReplies.length).toBe(1);
    });

    it("reply to topic and update reply", async () => {
        await createTopicReply(userLoggedIn, topic.id, "This message should be modified!");
        const replies: TopicReply[] = await getTopicRepliesPriorToTimestamp(topic.id, Date.now(), 10);
        expect(replies.length).toBeGreaterThanOrEqual(1);
        const reply: TopicReply = replies[0];

        await modifyReply(userLoggedIn, reply.id, "Tis post has been modified");
    });

    it("star rate topic", async () => {
        await giveTopicStarRating(userLoggedIn, topic.id);
        const usersWhoRated: string[] = await getTopicStarRaters(topic.id);
        expect(usersWhoRated.length).toBe(1);
    });

    it("remove star rate on topic", async () => {
        await removeTopicStarRating(userLoggedIn, topic.id);
        const usersWhoRated: string[] = await getTopicStarRaters(topic.id);
        expect(usersWhoRated.length).toBe(0);
    });

    it("star rate topic again", async () => {
        await giveTopicStarRating(userLoggedIn, topic.id);
        const usersWhoRated: string[] = await getTopicStarRaters(topic.id);
        expect(usersWhoRated.length).toBe(1);
    });

    it("topic subscription", async () => {
        await subscribeToTopic(secondLoggedInUser, topic.id);
        let subscribers: string[] = await getTopicSubscribers(topic.id);
        expect(subscribers.length).toBe(2);

        await unsubscribeFromTopic(secondLoggedInUser, topic.id);
        subscribers = await getTopicSubscribers(topic.id);
        expect(subscribers.length).toBe(1);
    });

    it("get topic after timestamp", async () => {
        const title: string = "It is fun to program in Rell";
        const message: string = "It is fun to program in #Rell. It is a great language to interact with a #blockchain.";
        await createTopic(userLoggedIn, channel, title, message);
        const topics: Topic[] = await getTopicsAfterTimestamp(Date.now() - 30000, 10);
        expect(topics.length).toBeGreaterThan(0);
    });

    it("get topic prior to timestamp", async () => {
        const title: string = "Blockchain has never been easier";
        const message: string = "This is a fact.";
        await createTopic(userLoggedIn, channel, title, message);
        const topics: Topic[] = await getTopicsPriorToTimestamp(Date.now(), 10);
        expect(topics.length).toBeGreaterThan(0);
    });

    it("get topic by id", async () => {
        const fetchedTopic: Topic = await getTopicById(topic.id);
        expect(topic.message).toBe(fetchedTopic.message);
    });

    it("get replies by user", async () => {
        const replies: TopicReply[] = await getTopicRepliesByUserPriorToTimestamp(userLoggedIn.name, Date.now(), 10);
        expect(replies.length).toBeGreaterThanOrEqual(1);
    });

    it("create and mofiy topic", async () => {
        const title: string = "Rell Assistance";
        const message: string = "Post your rell questions here to receive help from the community.";
        await createTopic(userLoggedIn, "rell", title, message);
        const topics: Topic[] = await getTopicsByUserPriorToTimestamp(userLoggedIn.name, Date.now(), 10);
        expect(topics.length).toBeGreaterThan(0);

        await modifyTopic(userLoggedIn, topics[0].id, "Post your rell questions here to receive help from the awesome community.")
    });

    it("count posts", async () => {
        await createTopic(userLoggedIn, "rell", "Why Rell?", "Could someone clarify for me some benefits of using Rell?");
        const topics: Topic[] = await getTopicsByUserPriorToTimestamp(userLoggedIn.name, Date.now(), 10);
        expect(topics.length).toBeGreaterThan(0);

        await createTopicReply(secondLoggedInUser, topics[0].id, "Rell is very developer friendly as it a language which is very familiar to SQL.");

        const countOfTopics: number = await countTopicsByUser(userLoggedIn.name);
        const countOfReplies: number = await countRepliesByUser(secondLoggedInUser.name);

        expect(countOfTopics).toBeGreaterThan(0);
        expect(countOfReplies).toBeGreaterThan(0);
    });

    it("count topic and reply stars", async () => {
        const topicStars: number = await countTopicStarRatingForUser(userLoggedIn.name);
        const replyStars: number = await countReplyStarRatingForUser(userLoggedIn.name);

        expect(topicStars).toBe(1);
        expect(replyStars).toBe(1);
    });

    it("get all topics by popularity", async () => {
        const topics: Topic[] = await getAllTopicsByPopularityAfterTimestamp(0, 10);
        expect(topics.length).toBeGreaterThanOrEqual(1);
    });

});