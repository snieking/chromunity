import {GTX, PRIV_KEY, PUB_KEY} from "./Postchain";
import {hash, encrypt, generatePrivateKey, generatePublicKey, toBuffer} from "./CryptoService";
import {User} from "../types";
import {godAlias, setUser} from "../util/user-util";

function initAdmin(username: string, password: string) {
    const tx = GTX.newTransaction([PUB_KEY]);
    tx.addOperation("registerUser",
        username,
        hash(password),
        PUB_KEY,
        encrypt(PRIV_KEY, PRIV_KEY.toString("hex")));
    tx.sign(PRIV_KEY, PUB_KEY);
    tx.postAndWaitConfirmation().catch();
}

export function register(name: string, password: string) {
    if (name === godAlias()) {
        initAdmin(name, password);
    } else {
        const uPrivKey = generatePrivateKey();
        const uPubKey = generatePublicKey(uPrivKey);

        const privKey = toBuffer(uPrivKey);
        const pubKey = toBuffer(uPubKey);

        const hashedPassword = hash(password);
        const encryptedPrivKey = encrypt(PRIV_KEY, uPrivKey);

        const tx = GTX.newTransaction([pubKey]);
        tx.addOperation("registerUser",
            name,
            hashedPassword,
            toBuffer(uPubKey),
            encryptedPrivKey);
        tx.sign(privKey, pubKey);
        tx.postAndWaitConfirmation().catch(console.log);
    }
}

export function login(uName: string, password: string): Promise<User> {
    const hashedPassword = hash(password);
    return GTX.query("login", { name: uName, password: hashedPassword })
        .then((key: string) => {
            const user: User = { name: uName, encryptedKey: key };
            setUser(user);
            return user;
        });
}

export function isRegistered(name: string): Promise<boolean> {
    return GTX.query("isUserRegistered", { name: name }).then((arr: []) => arr.length > 0);
}
