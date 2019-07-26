import { UserSettings } from './../types';
import {GTX} from "./Postchain";
import {seedFromMnemonic, seedToKey} from "./CryptoService";
import {User} from "../types";
import {setMnemonic, setUser} from "../util/user-util";
import * as BoomerangCache from "boomerang-cache";
import { uniqueId } from '../util/util';

const boomerang = BoomerangCache.create("avatar-bucket", { storage: "session", encrypt: false });

export function register(name: string, password: string, mnemonic: string) {
    setMnemonic(mnemonic);

    const seed = seedFromMnemonic(mnemonic, password);
    const {privKey, pubKey} = seedToKey(seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("register_user", name, pubKey);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function login(name: string, password: string, mnemonic: string): Promise<User> {
    setMnemonic(mnemonic);
    return GTX.query("get_user", {name: name})
        .then((blockchainUser: BlockchainUser) => {
            const seed = seedFromMnemonic(mnemonic, password);
            //const {privKey, pubKey} = seedToKey(seed);
            // TODO: Validate pubkey matches with the one in the blockchain user

            const user: User = {name: name, seed: seed};
            setUser(user);
            return user;
        });
}

export function isRegistered(name: string): Promise<boolean> {
    return GTX.query("get_user", {name: name})
        .then((any: any) => any != null)
        .catch(false);
}

export function getUserSettings(user: User): Promise<UserSettings> {
    return GTX.query("get_user_settings", { name: user.name });
}

export function getUserSettingsCached(name: string, cacheDuration: number): Promise<UserSettings> {
    const cachedAvatar: UserSettings = boomerang.get(name);

    if (cachedAvatar != null) {
        return new Promise<UserSettings>(resolve => resolve(cachedAvatar));
    }

    return GTX.query("get_user_settings", { name: name }).then((settings: UserSettings) => {
        boomerang.set(name, settings, cacheDuration);
        return settings;
    });
}

export function updateUserSettings(user: User, avatar: string, description: string) {
    boomerang.remove(user.name);

    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("update_user_settings", user.name, avatar, description);
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

interface BlockchainUser {
    name: string,
    pubkey: string,
    registered: number
}
