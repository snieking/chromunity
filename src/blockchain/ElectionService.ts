import { Election, User } from "../types";
import { GTX } from "./Postchain";
import { seedToKey } from "./CryptoService";
import { sortByFrequency, uniqueId } from "../util/util";

export function triggerElection(user: User, completionTimestamp: number) {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("triggerElection", user.name, uniqueId(), completionTimestamp);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getElectionVotes(electionId: string) {
    return GTX.query("getElectionVotes", { electionId: electionId })
        .then((candidates: any[]) => sortByFrequency(candidates));
}

export function completeElection(user: User, electionId: string, sortedCandidates: string[]) {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);

    tx.addOperation("completeElection", user.name, electionId, sortedCandidates);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function signUpForElection(user: User, electionId: string): Promise<any> {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("signUpForElection", user.name, electionId);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function voteForCandidate(user: User, candidate: string, electionId: string): Promise<any> {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("voteForCandidate", user.name, candidate, electionId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getElectionVoteForUser(name: string, electionId: string): Promise<string> {
    return GTX.query("getUserVoteInElection", { name: name, electionId: electionId });
}

export function getElectionCandidates(electionId: string): Promise<string[]> {
    return GTX.query("getElectionCandidates", { electionId: electionId });
}

export function getUncompletedElection(): Promise<string> {
    return GTX.query("getUncompletedElection", {});
}

export function getNextElectionTimestamp(): Promise<Election> {
    return GTX.query("getNextElection", { timestamp: Date.now() });
}
