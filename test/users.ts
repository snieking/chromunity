import {getANumber} from "./helper";
import * as bip39 from "bip39";
import {login, register} from "../src/blockchain/UserService";
import {seedFromMnemonic} from "../src/blockchain/CryptoService";

const names: string[] = ["Anastasia", "Viktor", "Alex", "Riccardo", "Henrik", "Gus", "Irene", "Amy", "Todd", "Olle", "Alisa", "Or"];

const ADMIN_USER = {
    name: "admin",
    password: "admin",
    mnemonic: "rule comfort scheme march fresh defy radio width crash family toward index"
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
    return login(user.name, user.password, seedFromMnemonic(user.mnemonic, user.password));
};

const GET_LOGGED_IN_ADMIN_USER = async () => {
    await register(ADMIN_USER.name, ADMIN_USER.password, ADMIN_USER.mnemonic);
    return login(ADMIN_USER.name, ADMIN_USER.password, seedFromMnemonic(ADMIN_USER.mnemonic, ADMIN_USER.password));
};

export {
    GET_LOGGED_IN_ADMIN_USER,
    CREATE_LOGGED_IN_USER
}