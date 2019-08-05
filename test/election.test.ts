import {RepresentativeAction, RepresentativeReport, UserMeta} from '../src/types';
import {getUserMeta, login, register} from "../src/blockchain/UserService";
import {
    completeElection,
    getElectionCandidates,
    getElectionVoteForUser,
    getElectionVotes,
    getUncompletedElection,
    signUpForElection,
    triggerElection,
    voteForCandidate
} from "../src/blockchain/ElectionService";
import {sleepUntil} from "./helper";


import {Election, Topic, TopicReply, User} from "../src/types";
import {getCachedUserMeta, setUserMeta} from "../src/util/user-util";
import {
    getAllRepresentativeActionsPriorToTimestamp,
    getCurrentRepresentativePeriod,
    getRepresentatives,
    getUnhandledReports,
    handleReport,
    reportReply,
    reportTopic,
    suspendUser
} from "../src/blockchain/RepresentativesService";
import {
    createTopic,
    createTopicReply,
    getTopicById,
    getTopicRepliesPriorToTimestamp,
    getTopicsByUserPriorToTimestamp,
    removeTopic,
    removeTopicReply
} from "../src/blockchain/TopicService";
import {adminAddRepresentative, adminRemoveRepresentative} from "../src/blockchain/AdminService";
import {ADMIN_USER, JOKER_USER} from "./users";


jest.setTimeout(30000);

describe("election test", () => {

    const channel: string = "ElectionTests";

    let adminUser: User;

    it("register admin", async () => {
        const admin = ADMIN_USER;
        await expect(register(admin.name, admin.password, admin.mnemonic)).resolves.toBe(null);
        console.log("Registered", admin.name, " with mnemonic", admin.mnemonic);
    });

    it("login admin", async () => {
        const admin = ADMIN_USER;
        adminUser = await login(admin.name, admin.password, admin.mnemonic);

        expect(adminUser).toBeDefined();
        expect(adminUser.name).toBe(admin.name);
        expect(adminUser.seed).toBeDefined();
    });

    it("hold election", async () => {
        const electionTimestamp = Date.now() + 10000;
        await triggerElection(adminUser, electionTimestamp);
        const electionId: string = await getUncompletedElection();
        expect(electionId).toBeDefined();

        await signUpForElection(adminUser);
        await voteForCandidate(adminUser, adminUser.name);

        const votedFor: string = await getElectionVoteForUser(adminUser.name);
        expect(votedFor).toBe(adminUser.name);

        const candidates: string[] = await getElectionCandidates();
        expect(candidates).toContain(adminUser.name);

        const sortedCandidatesByVote: string[] = await getElectionVotes();
        sleepUntil(electionTimestamp); // Sleep until election is over
        await completeElection(adminUser, sortedCandidatesByVote);

        const representatives: string[] = await getRepresentatives();
        const election: Election = await getCurrentRepresentativePeriod();

        expect(election.id).toBe(electionId);
        expect(representatives).toContain(adminUser.name);
    });

    it("as a representative remove topic and replies", async () => {
        const title: string = "This post should be removed";
        const message: string = "This post should be #removed, if not the #test is broken";
        await createTopic(adminUser, channel, title, message);

        var topics: Topic[] = await getTopicsByUserPriorToTimestamp(adminUser.name, Date.now(), 10);
        const topicToBeRemoved: Topic = topics[0];

        await removeTopic(adminUser, topicToBeRemoved.id);
        const removedTopic: Topic = await getTopicById(topicToBeRemoved.id);
        expect(removedTopic.title).toBe("[Removed]");

        await createTopicReply(adminUser, removedTopic.id, "This should also be removed");
        var replies: TopicReply[] = await getTopicRepliesPriorToTimestamp(removedTopic.id, Date.now(), 10);

        await removeTopicReply(adminUser, replies[0].id);
        replies = await getTopicRepliesPriorToTimestamp(removedTopic.id, Date.now(), 10);
        expect(replies[0].message).toBe("Removed by @admin");

        const actions: RepresentativeAction[] = await getAllRepresentativeActionsPriorToTimestamp(Date.now(), 2);
        expect(actions.length).toBe(2);
    });

    it("suspend user", async () => {
        const userToBeSuspended = JOKER_USER;
        await register(userToBeSuspended.name, userToBeSuspended.password, userToBeSuspended.mnemonic);
        const user: User = await login(userToBeSuspended.name, userToBeSuspended.password, userToBeSuspended.mnemonic);

        await suspendUser(adminUser, user.name);

        var meta: UserMeta = await getUserMeta(user.name);
        expect(meta.suspended_until).toBeGreaterThan(Date.now());

        setUserMeta(meta);
        meta = await getCachedUserMeta();
        expect(meta.suspended_until).toBeGreaterThan(Date.now());
    });

    it("admin toggle representative on user", async () => {
        const userToBeSuspended = JOKER_USER;
        var representatives: string[] = await getRepresentatives();

        expect(representatives.length).toBe(1);

        await adminAddRepresentative(adminUser, userToBeSuspended.name);
        representatives = await getRepresentatives();
        expect(representatives.length).toBe(2);

        await adminRemoveRepresentative(adminUser, userToBeSuspended.name);
        representatives = await getRepresentatives();
        expect(representatives.length).toBe(1);
    });

    it("report topic & reply and handle them as a representative", async () => {
        var unhandledReports: RepresentativeReport[] = await getUnhandledReports();
        expect(unhandledReports.length).toBe(0);

        await createTopic(adminUser, channel, "This topic is about to be reported", "Toxic content in here!");
        const topics: Topic[] = await getTopicsByUserPriorToTimestamp(adminUser.name, Date.now(), 1);
        const topic: Topic = topics[0];

        await reportTopic(adminUser, topic.id);
        unhandledReports = await getUnhandledReports();
        expect(unhandledReports.length).toBe(1);

        await createTopicReply(adminUser, topic.id, "This message is even more toxic!");
        const topicReplies: TopicReply[] = await getTopicRepliesPriorToTimestamp(topic.id, Date.now(), 10);
        const topicReply: TopicReply = topicReplies[0];

        await reportReply(adminUser, topic.id, topicReply.id);
        unhandledReports = await getUnhandledReports();
        expect(unhandledReports.length).toBe(2);

        await handleReport(adminUser, unhandledReports[0].id);
        unhandledReports = await getUnhandledReports();
        expect(unhandledReports.length).toBe(1);
    });

});