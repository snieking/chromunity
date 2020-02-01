import { executeOperations, executeQuery } from "./Postchain";
import { Election, RepresentativeAction, RepresentativeReport, ChromunityUser } from "../types";
import { toLowerCase, uniqueId } from "../util/util";

import * as BoomerangCache from "boomerang-cache";
import { nop, op } from "ft3-lib";
import { removeTopicIdFromCache } from "./TopicService";

const representativesCache = BoomerangCache.create("rep-bucket", { storage: "session", encrypt: false });
const localCache = BoomerangCache.create("rep-local", { storage: "local", encrypt: false });

const LOGBOOK_LAST_READ_KEY = "logbookLastRead";

export const updateLogbookLastRead = (timestamp: number) => localCache.set(LOGBOOK_LAST_READ_KEY, timestamp);

export const retrieveLogbookLastRead = (): number => {
  const lastRead = localCache.get(LOGBOOK_LAST_READ_KEY);
  return lastRead != null ? lastRead : 0;
};

export const hasReportId = (id: string) => representativesCache.get(id) != null;
const addReportId = (id: string) => representativesCache.set(id, true);

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

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, reportId)
  );
}

export const REMOVE_TOPIC_OP_ID = "remove_topic";

export function removeTopic(user: ChromunityUser, topicId: string) {
  const reportId = REMOVE_TOPIC_OP_ID + ":" + topicId;
  if (hasReportId(reportId)) {
    return;
  }

  return executeOperations(
    user.ft3User,
    op(REMOVE_TOPIC_OP_ID, toLowerCase(user.name), user.ft3User.authDescriptor.id, topicId)
  ).then(() => {
    addReportId(reportId);
    removeTopicIdFromCache(topicId);
  });
}

export const REMOVE_TOPIC_REPLY_OP_ID = "remove_topic_reply";

export function removeTopicReply(user: ChromunityUser, topicReplyId: string) {
  const reportId = REMOVE_TOPIC_REPLY_OP_ID + ":" + topicReplyId;
  if (hasReportId(reportId)) {
    return;
  }

  return executeOperations(
    user.ft3User,
    op(REMOVE_TOPIC_REPLY_OP_ID, toLowerCase(user.name), user.ft3User.authDescriptor.id, topicReplyId)
  ).then(() => addReportId(reportId));
}

export const SUSPEND_USER_OP_ID = "suspend_user";

export function suspendUser(user: ChromunityUser, userToBeSuspended: string) {
  const reportId = SUSPEND_USER_OP_ID + ":" + userToBeSuspended;
  if (hasReportId(reportId)) {
    return;
  }

  return executeOperations(
    user.ft3User,
    op(SUSPEND_USER_OP_ID, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(userToBeSuspended))
  )
    .catch()
    .then(() => addReportId(SUSPEND_USER_OP_ID + ":" + userToBeSuspended));
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

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, uniqueId(), text)
  );
}

export function getUnhandledReports(): Promise<RepresentativeReport[]> {
  return executeQuery("get_unhandled_representative_reports", {});
}

export function getTimesUserWasDistrusted(name: string) {
  return executeQuery("times_user_was_distrusted", { name });
}

export function getTimesUserDistrustedSomeone(name: string) {
  return executeQuery("times_user_distrusted_someone", { name });
}
