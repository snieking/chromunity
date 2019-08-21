import { BLOCKCHAIN, GTX } from "./Postchain";
import { Election, RepresentativeAction, RepresentativeReport, ChromunityUser } from "../types";
import { uniqueId } from "../util/util";

import * as BoomerangCache from "boomerang-cache";

const representativesCache = BoomerangCache.create("rep-bucket", { storage: "session", encrypt: true });

export function getCurrentRepresentativePeriod(): Promise<Election> {
  return GTX.query("get_current_representative_period", { timestamp: Date.now() });
}

export function clearRepresentativesCache() {
  representativesCache.remove("current-reps");
}

export function getRepresentatives(): Promise<string[]> {
  const currentReps: string[] = representativesCache.get("current-reps");
  if (currentReps != null) {
    return new Promise<string[]>(resolve => resolve(currentReps));
  }

  return GTX.query("get_representatives", {}).then((reps: string[]) => {
    representativesCache.set("current-reps", reps, 600);
    return reps;
  });
}

export function getAllRepresentativeActionsPriorToTimestamp(
  timestamp: number,
  pageSize: number
): Promise<RepresentativeAction[]> {
  return GTX.query("get_all_representative_actions", { timestamp: timestamp, page_size: pageSize });
}

export function handleReport(user: ChromunityUser, reportId: string) {
  return BLOCKCHAIN.then(bc =>
    bc.call(user.ft3User, "handle_representative_report", user.name.toLocaleLowerCase(), user.ft3User.authDescriptor.hash().toString("hex"), reportId)
  );
}

export function suspendUser(user: ChromunityUser, userToBeSuspended: string) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "suspend_user",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      userToBeSuspended.toLocaleLowerCase()
    )
  );
}

export function reportTopic(user: ChromunityUser, topicId: string) {
  return report(user, "topic /t/" + topicId + " was reported by @" + user.name);
}

export function reportReply(user: ChromunityUser, topicId: string, replyId: string) {
  return report(user, "Reply /t/" + topicId + "#reply-" + replyId + " was reported by @" + user.name);
}

function report(user: ChromunityUser, text: string) {
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      "create_representative_report",
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      uniqueId(),
      text
    )
  );
}

export function getUnhandledReports(): Promise<RepresentativeReport[]> {
  return GTX.query("get_unhandled_representative_reports", {});
}
