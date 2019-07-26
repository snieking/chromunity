import {GTX} from "./Postchain";
import {Election, RepresentativeAction} from "../types";

export function getCurrentRepresentativePeriod(): Promise<Election> {
    return GTX.query("get_current_representative_period", { timestamp: Date.now() });
}

export function getRepresentatives(representativePeriodId: string): Promise<string[]> {
    return GTX.query("get_representatives", { representative_period_id: representativePeriodId });
}

export function getAllRepresentativeActionsPriorToTimestamp(timestamp: number, pageSize: number): Promise<RepresentativeAction[]> {
    return GTX.query("get_all_representative_actions", { timestamp: timestamp, page_size: pageSize });
}
