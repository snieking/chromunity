import { executeOperations, executeQuery } from "./Postchain";
import { Election, RepresentativeAction, RepresentativeReport, ChromunityUser } from "../types";
import { createStopwatchStarted, handleException, stopStopwatch, toLowerCase, uniqueId } from "../util/util";

import * as BoomerangCache from "boomerang-cache";
import { gaRellOperationTiming, gaSocialEvent } from "../GoogleAnalytics";
import { nop, op } from "ft3-lib";

const representativesCache = BoomerangCache.create("rep-bucket", { storage: "session", encrypt: true });

export function getCurrentRepresentativePeriod(): Promise<Election> {
  return executeQuery("get_current_representative_period", { timestamp: Date.now() });
}

export function clearRepresentativesCache() {
  representativesCache.remove("current-reps");
}

export function getRepresentatives(): Promise<string[]> {
  return executeQuery("get_representatives", {});
}

export function getTimesRepresentative(name: string): Promise<number> {
  return executeQuery("get_number_of_times_representative", { name });
}

export function getAllRepresentativeActionsPriorToTimestamp(
  timestamp: number,
  pageSize: number
): Promise<RepresentativeAction[]> {
  return executeQuery("get_all_representative_actions", { timestamp, page_size: pageSize });
}

export function handleReport(user: ChromunityUser, reportId: string) {
  const rellOperation = "handle_representative_report";
  gaSocialEvent(rellOperation, user.name);

  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, reportId)
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function suspendUser(user: ChromunityUser, userToBeSuspended: string) {
  const rellOperation = "suspend_user";
  gaSocialEvent(rellOperation, userToBeSuspended);

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(userToBeSuspended))
  );
}

export function distrustAnotherRepresentative(user: ChromunityUser, distrusted: string) {
  return executeOperations(
    user.ft3User,
    op("distrust_representative", user.ft3User.authDescriptor.id, user.name, toLowerCase(distrusted)),
    nop()
  );
}

export function isRepresentativeDistrustedByMe(user: ChromunityUser, distrusted: string): Promise<boolean> {
  return executeQuery("is_rep_distrusted_by_me", { me: user.name, rep: distrusted });
}

export function reportTopic(user: ChromunityUser, topicId: string) {
  return report(user, "topic /t/" + topicId + " was reported by @" + user.name);
}

export function reportReply(user: ChromunityUser, topicId: string, replyId: string) {
  return report(user, "Reply /t/" + topicId + "#" + replyId + " was reported by @" + user.name);
}

function report(user: ChromunityUser, text: string) {
  const rellOperation = "create_representative_report";
  gaSocialEvent(rellOperation, text);
  const sw = createStopwatchStarted();

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, uniqueId(), text)
  )
    .then(value => {
      gaRellOperationTiming(rellOperation, stopStopwatch(sw));
      return value;
    })
    .catch((error: Error) => handleException(rellOperation, sw, error));
}

export function getUnhandledReports(): Promise<RepresentativeReport[]> {
  return executeQuery("get_unhandled_representative_reports", {});
}
