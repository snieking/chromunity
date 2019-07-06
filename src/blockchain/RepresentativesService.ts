import {GTX} from "./Postchain";
import {Election} from "../types";

export function getCurrentRepresentativePeriod(): Promise<Election> {
    return GTX.query("getCurrentRepresentativePeriod", { timestamp: Date.now() });
}

export function getRepresentatives(representativePeriodId: string): Promise<string[]> {
    return GTX.query("getRepresentatives", { representativePeriodId: representativePeriodId });
}
