import {GTX} from "./Postchain";
import {Election, RepresentativeAction, RepresentativeReport, User} from "../types";
import {seedToKey} from "./CryptoService";
import {uniqueId} from "../util/util";

import * as BoomerangCache from "boomerang-cache";

const representativesCache = BoomerangCache.create("rep-bucket", {storage: "session", encrypt: true});

export function getCurrentRepresentativePeriod(): Promise<Election> {
    return GTX.query("get_current_representative_period", {timestamp: Date.now()});
}

export function clearRepresentativesCache() {
    representativesCache.remove("current-reps");
}

export function getRepresentatives(): Promise<string[]> {
    const currentReps: string[] = representativesCache.get("current-reps");
    if (currentReps != null) {
        return new Promise<string[]>(resolve => resolve(currentReps));
    }

    return GTX.query("get_representatives", {})
        .then((reps: string[]) => {
            representativesCache.set("current-reps", reps, 600);
            return reps;
        });
}

export function getAllRepresentativeActionsPriorToTimestamp(timestamp: number, pageSize: number): Promise<RepresentativeAction[]> {
    return GTX.query("get_all_representative_actions", {timestamp: timestamp, page_size: pageSize});
}

export function handleReport(user: User, reportId: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);

    tx.addOperation("handle_representative_report", user.name.toLocaleLowerCase(), reportId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function suspendUser(user: User, userToBeSuspended: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);

    tx.addOperation("suspend_user", user.name.toLocaleLowerCase(), userToBeSuspended.toLocaleLowerCase());
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function reportTopic(user: User, topicId: string) {
    return report(user, "Topic /t/" + topicId + " was reported by @" + user.name);
}

export function reportReply(user: User, topicId: string, replyId: string) {
    return report(user, "Reply /t/" + topicId + "#reply-" + replyId + " was reported by @" + user.name);
}

function report(user: User, text: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);

    tx.addOperation("create_representative_report", user.name.toLocaleLowerCase(), uniqueId(), text);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getUnhandledReports(): Promise<RepresentativeReport[]> {
    return GTX.query("get_unhandled_representative_reports", {});
}