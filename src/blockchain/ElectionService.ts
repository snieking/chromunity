import { Election, ChromunityUser } from "../types";
import { executeOperations, executeQuery } from "./Postchain";
import { toLowerCase } from "../util/util";
import { nop, op } from "ft3-lib";
import { electionEvent } from "../util/matomo";

export function processElection(user: ChromunityUser) {
  return executeOperations(user.ft3User, op("process_election"), nop());
}

export function signUpForElection(user: ChromunityUser): Promise<any> {
  electionEvent("sign-up");
  return executeOperations(
    user.ft3User,
    op("sign_up_for_election", toLowerCase(user.name), user.ft3User.authDescriptor.id),
    nop()
  );
}

export function voteForCandidate(user: ChromunityUser, candidate: string): Promise<any> {
  electionEvent("vote");
  return executeOperations(
    user.ft3User,
    op(
      "vote_for_candidate",
      toLowerCase(user.name),
      user.ft3User.authDescriptor.hash().toString("hex"),
      toLowerCase(candidate)
    ),
    nop()
  );
}

export function getElectionVoteForUser(name: string): Promise<string> {
  return executeQuery("get_user_vote_in_election", { name: toLowerCase(name) });
}

export function getElectionCandidates(): Promise<string[]> {
  return executeQuery("get_election_candidates", {});
}

export function getUncompletedElection(): Promise<string> {
  return executeQuery("get_uncompleted_election", {});
}

export function getNextElectionTimestamp(): Promise<Election> {
  return executeQuery("get_next_election", {});
}

export function blocksUntilElectionWrapsUp(): Promise<number> {
  return executeQuery("blocks_until_election_wraps_up", {});
}

export function blocksUntilNextElection(): Promise<number> {
  return executeQuery("blocks_until_next_election", {});
}

export function isEligibleForVoting(name: string): Promise<boolean> {
  return executeQuery("eligible_for_voting", { name });
}
