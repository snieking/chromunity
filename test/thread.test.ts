import { Thread } from './../src/types';
import { register, login } from "../src/blockchain/UserService";
import { createThread } from "../src/blockchain/MessageService"
import { getANumber } from "./helper";

import * as bip39 from "bip39";
import { User } from "../src/types";

jest.setTimeout(30000);

describe("Thread tests", () => {

    const user = {
        name: "viktor_" + getANumber(),
        password: "userPSW1",
        mnemonic: bip39.generateMnemonic(160)
    };

    it("register user " + user.name, async done => {
        expect.assertions(1);

        await expect(register(user.name, user.password, user.mnemonic)).resolves.toBe(null);
        console.log("Registered", user.name, " with mnemonic", user.mnemonic);
        done();
    });

    it("create a thread", async done => {
        expect.assertions(2);
        const loggedInUser: User = await login(user.name, user.password, user.mnemonic);
        expect(loggedInUser).toBeDefined();
        const message: string = "It's pretty neat that this forum is powered by a blockchain";
        await expect(createThread(loggedInUser, message)).toBeDefined();
        done();
    });

});