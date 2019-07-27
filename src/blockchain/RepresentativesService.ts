import {GTX} from "./Postchain";
import {Election, RepresentativeAction, User} from "../types";
import { seedToKey } from "./CryptoService";
import { uniqueId } from "../util/util";

export function getCurrentRepresentativePeriod(): Promise<Election> {
    return GTX.query("get_current_representative_period", { timestamp: Date.now() });
}

export function getRepresentatives(representativePeriodId: string): Promise<string[]> {
    return GTX.query("get_representatives", { representative_period_id: representativePeriodId });
}

export function getAllRepresentativeActionsPriorToTimestamp(timestamp: number, pageSize: number): Promise<RepresentativeAction[]> {
    return GTX.query("get_all_representative_actions", { timestamp: timestamp, page_size: pageSize });
}

export function suspendUser(user: User, userToBeSuspended: string) {
    const { privKey, pubKey } = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);

    tx.addOperation("suspend_user", user.name, userToBeSuspended);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}
