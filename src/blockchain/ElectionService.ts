import { Election, ChromunityUser } from "../types";
import { BLOCKCHAIN, GTX } from "./Postchain";
import { uniqueId } from "../util/util";

export function processElection(user: ChromunityUser) {
  return BLOCKCHAIN.then(bc =>
    bc.transactionBuilder()
      .addOperation("process_election")
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
  );
}

export function signUpForElection(user: ChromunityUser): Promise<any> {
  return BLOCKCHAIN.then(bc =>
    bc.transactionBuilder()
      .addOperation("sign_up_for_election", user.name.toLocaleLowerCase(), user.ft3User.authDescriptor.hash().toString("hex"))
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
  );
}

export function voteForCandidate(user: ChromunityUser, candidate: string): Promise<any> {
  return BLOCKCHAIN.then(bc =>
    bc.transactionBuilder()
      .addOperation(
        "vote_for_candidate",
        user.name.toLocaleLowerCase(),
        user.ft3User.authDescriptor.hash().toString("hex"),
        candidate
      )
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
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
  return GTX.query("get_next_election", {});
}

export function blocksUntilElectionWrapsUp(): Promise<number> {
  return GTX.query("blocks_until_election_wraps_up", {});
}

export function blocksUntilNextElection(): Promise<number> {
  return GTX.query("blocks_until_next_election", {});
}
