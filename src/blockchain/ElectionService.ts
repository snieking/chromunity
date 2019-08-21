import { Election, ChromunityUser } from "../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import { sortByFrequency, uniqueId } from "../util/util";

export function triggerElection(user: ChromunityUser, completionTimestamp: number) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "trigger_election",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      uniqueId(),
      completionTimestamp
    )
  );
}

export function getElectionVotes() {
  return GTX.query("get_election_votes", {}).then((candidates: string[]) => sortByFrequency(candidates));
}

export function completeElection(user: ChromunityUser, sortedCandidates: string[]) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "complete_election",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      sortedCandidates
    )
  );
}

export function signUpForElection(user: ChromunityUser): Promise<any> {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "sign_up_for_election",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex")
    )
  );
}

export function voteForCandidate(user: ChromunityUser, candidate: string): Promise<any> {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "vote_for_candidate",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      candidate
    )
  );
}

export function getElectionVoteForUser(name: string): Promise<string> {
  return GTX.query("get_user_vote_in_election", {
    name: name.toLocaleLowerCase()
  });
}

export function getElectionCandidates(): Promise<string[]> {
  return GTX.query("get_election_candidates", {});
}

export function getUncompletedElection(): Promise<string> {
  return GTX.query("get_uncompleted_election", {});
}

export function getNextElectionTimestamp(): Promise<Election> {
  return GTX.query("get_next_election", { timestamp: Date.now() });
}
