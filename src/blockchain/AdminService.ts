import {User} from "../types";
import {seedToKey} from "./CryptoService";
import {GTX} from "./Postchain";
import {uniqueId} from "../util/util";
import {clearRepresentativesCache} from "./RepresentativesService";

export function adminAddRepresentative(user: User, username: string) {
    return toggleRepresentative(user, username.toLocaleLowerCase(), "tmp_add_representative");
}

export function adminRemoveRepresentative(user: User, username: string) {
    return toggleRepresentative(user, username.toLocaleLowerCase(), "tmp_remove_representative");
}

function toggleRepresentative(user: User, username: string, rellOperation: string) {
    clearRepresentativesCache();
    const {privKey, pubKey} = seedToKey(user.seed);

    const tx = GTX.newTransaction([pubKey]);

    tx.addOperation(rellOperation, user.name, username.toLocaleLowerCase());
    tx.addOperation('nop', uniqueId());
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}