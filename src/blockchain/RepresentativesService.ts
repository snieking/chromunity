import { BLOCKCHAIN, GTX } from "./Postchain";
import { Election, RepresentativeAction, RepresentativeReport, ChromunityUser } from "../types";
import { createStopwatchStarted, handleGADuringException, stopStopwatch, uniqueId } from "../util/util";

import * as BoomerangCache from "boomerang-cache";
import { gaRellOperationTiming, gaSocialEvent } from "../GoogleAnalytics";

const representativesCache = BoomerangCache.create("rep-bucket", { storage: "session", encrypt: true });

export function getCurrentRepresentativePeriod(): Promise<Election> {
  return GTX.query("get_current_representative_period", { timestamp: Date.now() });
}

export function clearRepresentativesCache() {
  representativesCache.remove("current-reps");
}

export function getRepresentatives(): Promise<string[]> {
  return GTX.query("get_representatives", {});
}

export function getAllRepresentativeActionsPriorToTimestamp(
  timestamp: number,
  pageSize: number
): Promise<RepresentativeAction[]> {
  return GTX.query("get_all_representative_actions", { timestamp: timestamp, page_size: pageSize });
}

export function handleReport(user: ChromunityUser, reportId: string) {
  const rellOperation = "handle_representative_report";
  gaSocialEvent(rellOperation, user.name);

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      reportId
    )
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleGADuringException(rellOperation, sw, error));
}

export function suspendUser(user: ChromunityUser, userToBeSuspended: string) {
  const rellOperation = "suspend_user";
  gaSocialEvent(rellOperation, userToBeSuspended);
  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
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
  const rellOperation = "create_representative_report";
  gaSocialEvent(rellOperation, text);
  const sw = createStopwatchStarted();

  return BLOCKCHAIN.then(bc =>
    bc.call(
      user.ft3User,
      rellOperation,
      user.name.toLocaleLowerCase(),
      user.ft3User.authDescriptor.hash().toString("hex"),
      uniqueId(),
      text
    )
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleGADuringException(rellOperation, sw, error));
}

export function getUnhandledReports(): Promise<RepresentativeReport[]> {
  return GTX.query("get_unhandled_representative_reports", {});
}
