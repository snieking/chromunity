import { register, login } from "../src/blockchain/UserService";
import { triggerElection, signUpForElection, getUncompletedElection, completeElection, voteForCandidate, getElectionCandidates, getElectionVoteForUser, getElectionVotes } from "../src/blockchain/ElectionService";
import { getANumber } from "./helper";


import * as bip39 from "bip39";
import { User, Election } from "../src/types";
import { isRepresentative, setUser } from "../src/util/user-util";
import { getRepresentatives, getCurrentRepresentativePeriod } from "../src/blockchain/RepresentativesService";

jest.setTimeout(30000);

describe("election test", () => {

    const admin = {
        name: "admin",
        password: "admin",
        mnemonic: bip39.generateMnemonic(160)
    }

    var adminUser: User;

    it("register admin", async () => {
        await expect(register(admin.name, admin.password, admin.mnemonic)).resolves.toBe(null);
        console.log("Registered", admin.name, " with mnemonic", admin.mnemonic);
    });

    it("login admin", async () => {
        adminUser = await login(admin.name, admin.password, admin.mnemonic);
        console.log("Logged in", adminUser);

        expect(adminUser).toBeDefined();
        expect(adminUser.name).toBe(admin.name);
        expect(adminUser.seed).toBeDefined();
    });

    it("hold election", async () => {
        const electionTimestamp = Date.now() + 10000;
        await triggerElection(adminUser, electionTimestamp);
        const electionId: string = await getUncompletedElection();
        expect(electionId).toBeDefined();

        await signUpForElection(adminUser, electionId);
        await voteForCandidate(adminUser, adminUser.name, electionId);

        const candidates: string[] = await getElectionCandidates(electionId);
        expect(candidates).toContain(adminUser.name);

        const sortedCandidatesByVote: string[] = await getElectionVotes(electionId);
        sleepUntil(electionTimestamp); // Sleep until election is over
        await completeElection(adminUser, electionId, sortedCandidatesByVote);

        const votedFor: string = await getElectionVoteForUser(adminUser.name, electionId);
        expect(votedFor).toBe(adminUser.name);

        const representatives: string[] = await getRepresentatives(electionId);
        const election: Election = await getCurrentRepresentativePeriod();

        expect(election.id).toBe(electionId);
        expect(representatives).toContain(adminUser.name);
    })

});

function sleepUntil(timestampToSleepToAfter: number) {
    console.log("Sleeping until: ", timestampToSleepToAfter);
    var start = new Date().getTime();
    while (true) {
        console.log("Sleeping");
        if (Date.now() > timestampToSleepToAfter) {
            break;
        }
    }
}