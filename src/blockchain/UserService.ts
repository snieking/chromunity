import {GTX, PRIV_KEY, PUB_KEY} from "./Postchain";
import {hash, encrypt, generatePrivateKey, generatePublicKey, toBuffer} from "./CryptoService";
import {User} from "../types";
import * as config from "../config.js";

function initAdmin(username: string) {
    const tx = GTX.newTransaction([PUB_KEY]);
    tx.addOperation('register_user',
        username,
        hash(config.adminPassword),
        PUB_KEY,
        encrypt(PRIV_KEY, PRIV_KEY.toString('hex')));
    tx.sign(PRIV_KEY, PUB_KEY);
    tx.postAndWaitConfirmation().catch();
}

export function register(name: string, password: string) {
    if (name == "chrotomia_admin") {
        initAdmin(name);
    } else {
        const uPrivKey = generatePrivateKey();
        const uPubKey = generatePublicKey(uPrivKey);

        const hashedPassword = hash(password);
        const encryptedPrivKey = encrypt(PRIV_KEY, uPrivKey);

        const tx = GTX.newTransaction([PUB_KEY]);
        tx.addOperation('register_user',
            name,
            hashedPassword,
            toBuffer(uPubKey),
            encryptedPrivKey);
        tx.sign(PRIV_KEY, PUB_KEY);
        tx.postAndWaitConfirmation().catch(console.log);
    }
}

export function login(uName: string, password: string): Promise<User> {
    const hashedPassword = hash(password);
    return GTX.query('login', {name: uName, password: hashedPassword})
        .then((key: string) => {
            const user: User = {name: uName, encryptedKey: key};
            return user;
        });
}
