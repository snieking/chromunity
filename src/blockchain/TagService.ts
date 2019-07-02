import {User} from "../types";
import {decrypt, generatePublicKey, toBuffer} from "./CryptoService";
import {GTX, PRIV_KEY} from "./Postchain";


export function storeTagsFromThread(user: User, threadId: string, tags: string[]) {
    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation('create_thread_tag', user.name, tags, threadId);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}
