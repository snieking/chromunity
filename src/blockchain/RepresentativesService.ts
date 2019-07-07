import {GTX} from "./Postchain";
import {Election, User} from "../types";
import {seedToKey} from "./CryptoService";

export function setThreadNotVisible(user: User, threadId: string) {
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("hideThread", user.name, threadId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getCurrentRepresentativePeriod(): Promise<Election> {
    return GTX.query("getCurrentRepresentativePeriod", { timestamp: Date.now() });
}

export function getRepresentatives(representativePeriodId: string): Promise<string[]> {
    return GTX.query("getRepresentatives", { representativePeriodId: representativePeriodId });
}
