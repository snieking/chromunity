import {Election, User} from "../types";
import {GTX} from "./Postchain";
import {seedToKey} from "./CryptoService";
import {sortByFrequency, uniqueId} from "../util/util";

export function triggerElection(user: User, completionTimestamp: number) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("trigger_election", user.name.toLocaleLowerCase(), uniqueId(), completionTimestamp);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getElectionVotes() {
    return GTX.query("get_election_votes", {})
        .then((candidates: any[]) => sortByFrequency(candidates));
}

export function completeElection(user: User, sortedCandidates: string[]) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);

    tx.addOperation("complete_election", user.name.toLocaleLowerCase(), sortedCandidates);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function signUpForElection(user: User): Promise<any> {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("sign_up_for_election", user.name.toLocaleLowerCase());
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function voteForCandidate(user: User, candidate: string): Promise<any> {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("vote_for_candidate", user.name.toLocaleLowerCase(), candidate);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getElectionVoteForUser(name: string): Promise<string> {
    return GTX.query("get_user_vote_in_election", {name: name.toLocaleLowerCase()});
}

export function getElectionCandidates(): Promise<string[]> {
    return GTX.query("get_election_candidates", {});
}

export function getUncompletedElection(): Promise<string> {
    return GTX.query("get_uncompleted_election", {});
}

export function getNextElectionTimestamp(): Promise<Election> {
    return GTX.query("get_next_election", {timestamp: Date.now()});
}
