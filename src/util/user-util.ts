import {UserMeta} from './../types';
import {User} from "../types";
import * as BoomerangCache from "boomerang-cache";
import {getRepresentatives} from "../blockchain/RepresentativesService";
import {getUserMeta} from '../blockchain/UserService';

const LOCAL_CACHE = BoomerangCache.create('local-bucket', {storage: 'local', encrypt: false});
const SESSION_CACHE = BoomerangCache.create('session-bucket', {storage: 'session', encrypt: true});

const USER_KEY = "user";
const ACCOUNTS_KEY = "accounts";
const USER_META_KEY = "user_meta";
const REPRESENTATIVE_KEY = "representative";

export function clearSession(): void {
    LOCAL_CACHE.remove(USER_KEY);
    SESSION_CACHE.remove(USER_META_KEY);
    SESSION_CACHE.remove(REPRESENTATIVE_KEY);
}

export function getAccounts(): User[] {
    const accounts: User[] = LOCAL_CACHE.get(ACCOUNTS_KEY);
    return accounts != null ? accounts : [];
}

export function setUser(user: User): void {
    const accounts: User[] = LOCAL_CACHE.get(ACCOUNTS_KEY);

    if (accounts == null) {
        LOCAL_CACHE.set(ACCOUNTS_KEY, [user]);
    } else {
        let filteredAccounts = accounts.filter(e => e.name !== user.name);
        LOCAL_CACHE.set(ACCOUNTS_KEY, [user].concat(filteredAccounts));
    }

    LOCAL_CACHE.set(USER_KEY, user, 86400);
}

export function setUserMeta(meta: UserMeta): void {
    SESSION_CACHE.set(USER_META_KEY, meta, 600);
}

export function getCachedUserMeta(): Promise<UserMeta> {
    const meta: UserMeta = SESSION_CACHE.get(USER_META_KEY);

    if (meta != null) {
        return new Promise<UserMeta>(resolve => resolve(meta));
    }

    const user: User = getUser();
    if (user == null) {
        return new Promise<UserMeta>(resolve => resolve(null));
    }

    return getUserMeta(user.name).then(meta => {
        setUserMeta(meta);
        return meta;
    })
}

export function getUser(): User {
    return LOCAL_CACHE.get(USER_KEY);
}

export function godAlias(): string {
    return "admin";
}

export function isGod(): boolean {
    const user: User = getUser();
    return user != null && user.name === godAlias();
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

    return getRepresentatives()
        .then((representatives: string[]) => getUser() != null && representatives.includes(getUser().name))
        .then((rep: boolean) => {
            setRepresentative(rep);
            return rep;
        }).catch(() => {
            setRepresentative(false);
            return false;
        });
}

export function ifEmptyAvatarThenPlaceholder(avatar: string, seed: string) {
    return (avatar !== "" && avatar != null) ? avatar : "https://avatars.dicebear.com/v2/gridy/" + seed + ".svg";
}
