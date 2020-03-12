import { executeOperations, executeQuery } from "./Postchain";
import { RepresentativeAction, RepresentativeReport, ChromunityUser, Topic, TopicReply } from "../types";
import { toLowerCase } from "../util/util";

import * as BoomerangCache from "boomerang-cache";
import { op } from "ft3-lib";
import { removeTopicIdFromCache } from "./TopicService";

const representativesCache = BoomerangCache.create("rep-bucket", { storage: "session", encrypt: false });
const localCache = BoomerangCache.create("rep-local", { storage: "local", encrypt: false });

const LOGBOOK_LAST_READ_KEY = "logbookLastRead";

export const updateLogbookLastRead = (timestamp: number) => localCache.set(LOGBOOK_LAST_READ_KEY, timestamp);

const REPORTS_LAST_READ_KEY = "reportsLastRead";

export const retrieveLogbookLastRead = (): number => {
  const lastRead = localCache.get(LOGBOOK_LAST_READ_KEY);
  return lastRead != null ? lastRead : 0;
};

export const updateReportsLastRead = (timestamp: number) => localCache.set(REPORTS_LAST_READ_KEY, timestamp);

export const retrieveReportsLastRead = (): number => {
  const lastRead = localCache.get(REPORTS_LAST_READ_KEY);
  return lastRead != null ? lastRead : 0;
};

export const hasReportedTopic = (user: ChromunityUser, topic: Topic): boolean =>
  user && topic && representativesCache.get(topic.id + ":" + user.name);

export const hasReportedReply = (user: ChromunityUser, reply: TopicReply): boolean =>
  user && reply && representativesCache.get(reply.id + ":" + user.name);

export const hasReportedId = (id: string) => representativesCache.get(id) != null;

const addReportId = (id: string) => representativesCache.set(id, true);

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

export const REMOVE_TOPIC_OP_ID = "remove_topic";

export function removeTopic(user: ChromunityUser, topicId: string) {
  const reportId = REMOVE_TOPIC_OP_ID + ":" + topicId;
  if (hasReportedId(reportId)) {
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
  if (hasReportedId(reportId)) {
    return;
  }

  return executeOperations(
    user.ft3User,
    op(REMOVE_TOPIC_REPLY_OP_ID, toLowerCase(user.name), user.ft3User.authDescriptor.id, topicReplyId)
  ).then(() => addReportId(reportId));
}

export const SUSPEND_USER_OP_ID = "suspend_user";

export const isUserSuspended = (user: string): boolean => hasReportedId(SUSPEND_USER_OP_ID + ":" + toLowerCase(user));

export function suspendUser(user: ChromunityUser, userToBeSuspended: string) {
  const reportId = SUSPEND_USER_OP_ID + ":" + toLowerCase(userToBeSuspended);
  if (hasReportedId(reportId)) {
    return;
  }

  return executeOperations(
    user.ft3User,
    op(SUSPEND_USER_OP_ID, toLowerCase(user.name), user.ft3User.authDescriptor.id, toLowerCase(userToBeSuspended))
  )
    .catch()
    .then(() => addReportId(SUSPEND_USER_OP_ID + ":" + userToBeSuspended));
}

export function reportTopic(user: ChromunityUser, topic: Topic) {
  const id = topic.id + ":" + user.name;
  return report(user, id, "topic /t/" + topic.id + " was reported by @" + user.name);
}

export function reportReply(user: ChromunityUser, reply: TopicReply) {
  const id = reply.id + ":" + user.name;
  return report(user, id, "Reply /t/" + reply.topic_id + "#" + reply.id + " was reported by @" + user.name);
}

function report(user: ChromunityUser, id: string, text: string) {
  const rellOperation = "create_representative_report";

  return executeOperations(
    user.ft3User,
    op(rellOperation, toLowerCase(user.name), user.ft3User.authDescriptor.id, id, text)
  ).then(() => addReportId(id));
}

export function getReports(): Promise<RepresentativeReport[]> {
  const date = new Date();
  date.setHours(date.getHours() - 72);
  return executeQuery("get_unhandled_representative_reports", { timestamp: date.getTime() });
}

export function distrustRepresentative(user: ChromunityUser, distrusted: string) {
  localCache.set("distrusted-" + distrusted, true);
  return executeOperations(
    user.ft3User,
    op("distrust_representative", toLowerCase(user.name), user.ft3User.authDescriptor.id, distrusted)
  );
}

export const isDistrustedByMe = (distrusted: string) => localCache.get("distrusted-" + distrusted) != null;
