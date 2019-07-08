import {User} from "../types";
import * as BoomerangCache from "boomerang-cache";
import {getCurrentRepresentativePeriod, getRepresentatives} from "../blockchain/RepresentativesService";

const LOCAL_CACHE = BoomerangCache.create('local-bucket', {storage: 'local', encrypt: false});
const SESSION_CACHE = BoomerangCache.create('session-bucket', {storage: 'session', encrypt: false});

const USER_KEY = "user";
const MNEMONIC_KEY = "mnemonic";
const REPRESENTATIVE_KEY = "representative";

export function setMnemonic(mnemonic: string): void {
    LOCAL_CACHE.set(MNEMONIC_KEY, mnemonic);
}

export function getMnemonic(): string {
    return LOCAL_CACHE.get(MNEMONIC_KEY, "");
}

export function setUser(user: User): void {
    SESSION_CACHE.set(USER_KEY, user);
}

export function getUser(): User {
    return SESSION_CACHE.get(USER_KEY, {});
}

export function godAlias(): string {
    return "admin";
}

export function isGod(): boolean {
    return getUser().name === godAlias();
}

export function setRepresentative(isRepresentative: boolean): void {
    SESSION_CACHE.set(REPRESENTATIVE_KEY, isRepresentative, 600);
}

/**
 * Checks whether or not the user is a representative and caches that response.
 */
export function isRepresentative(): Promise<boolean> {
    const isRepresentative: boolean = SESSION_CACHE.get(REPRESENTATIVE_KEY);

    if (isRepresentative != null) {
        return new Promise<boolean>(resolve => resolve(isRepresentative));
    }

    return getCurrentRepresentativePeriod()
        .then(election => getRepresentatives(election.id))
        .then((representatives: string[]) => representatives.includes(getUser().name))
        .then((isRepresentative: boolean) => {
            setRepresentative(isRepresentative);
            return isRepresentative;
        }).catch(() => {
            setRepresentative(false);
            return false;
        });
}
