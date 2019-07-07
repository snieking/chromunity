import {GTX} from "./Postchain";
import {seedFromMnemonic, seedToKey} from "./CryptoService";
import {User} from "../types";
import {setMnemonic, setUser} from "../util/user-util";

export function register(name: string, password: string, mnemonic: string) {
    setMnemonic(mnemonic);

    const seed = seedFromMnemonic(mnemonic, password);
    const {privKey, pubKey} = seedToKey(seed);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("registerUser", name, pubKey);
    tx.sign(privKey, pubKey);
    tx.postAndWaitConfirmation().catch(console.log);
}

export function login(name: string, password: string, mnemonic: string): Promise<User> {
    setMnemonic(mnemonic);
    return GTX.query("getUser", {name: name})
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
    return GTX.query("getUser", {name: name})
        .then((any: any) => any != null)
        .catch(false);
}

interface BlockchainUser {
    name: string,
    pubkey: string,
    registered: number
}
