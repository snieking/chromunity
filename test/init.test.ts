import {register} from "../src/blockchain/UserService";
import {getANumber, makeKeyPair} from "./helper";


import * as bip39 from "bip39";

jest.setTimeout(30000);


describe('Registers users', () => {

    const admin = {
        name: "admin",
        password: "admin",
        mnemonic: bip39.generateMnemonic(160)
    }

    const user01 = {
        name: "User01_" + getANumber(),
        password: "userPSW1",
        mnemonic: bip39.generateMnemonic(160)
    };


    it("registers one user", async () => {
        await expect(register(user01.name, user01.password, user01.mnemonic)).resolves.toBe(null);
    });

    it("registers one admin", async () => {
        await expect(register(admin.name, admin.password, admin.mnemonic)).resolves.toBe(null);
        console.log(admin.mnemonic);
    })
});
