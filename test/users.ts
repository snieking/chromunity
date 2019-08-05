import {getANumber} from "./helper";
import * as bip39 from "bip39";
import {login, register} from "../src/blockchain/UserService";

const names: string[] = ["anastasia", "viktor", "alex", "riccardo", "henrik", "gus", "irene", "amy", "todd", "olle", "alisa", "or"];

const ADMIN_USER = {
    name: "admin",
    password: "admin",
    mnemonic: "rule comfort scheme march fresh defy radio width crash family toward index"
};

const JOKER_USER = {
    name: "joker",
    password: "joker",
    mnemonic: "rule comfort scheme march fresh defy radio width crash family toward bike"
};

const CREATE_RANDOM_USER = () => {
    const randomNumber = Math.floor(Math.random() * names.length);

    return {
        name: names[randomNumber] + "_" + getANumber(),
        password: "password",
        mnemonic: bip39.generateMnemonic(160)
    };
};

const CREATE_LOGGED_IN_USER = async () => {
    const user = CREATE_RANDOM_USER();
    await register(user.name, user.password, user.mnemonic);
    return login(user.name, user.password, user.mnemonic);
};

export {
    ADMIN_USER,
    JOKER_USER,
    CREATE_LOGGED_IN_USER
}