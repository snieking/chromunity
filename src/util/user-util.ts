import {User} from "../types";
import * as BoomerangCache from "boomerang-cache";
import {getCurrentRepresentativePeriod, getRepresentatives} from "../blockchain/RepresentativesService";

const LOCAL_CACHE = BoomerangCache.create('local-bucket', {storage: 'local', encrypt: true});
const SESSION_CACHE = BoomerangCache.create('session-bucket', {storage: 'session', encrypt: true});

const USER_KEY = "user";
const REPRESENTATIVE_KEY = "representative";

export function setUser(user: User): void {
    LOCAL_CACHE.set(USER_KEY, user);
}

export function getUser(): User {
    return LOCAL_CACHE.get(USER_KEY, {});
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
