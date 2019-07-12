import { Thread } from './../src/types';
import { register, login } from "../src/blockchain/UserService";
import { createThread, getThreadsByUserIdPriorToTimestamp, createSubThread, getSubThreadsByParentId, starRate, getThreadStarRating, removeStarRate, getThreadsAfter, getThreadById, getThreadsPriorTo } from "../src/blockchain/MessageService"
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

    var userLoggedIn: User;
    var thread: Thread;

    it("register user " + user.name, async () => {
        await register(user.name, user.password, user.mnemonic);
    });

    it("login first user to use for creating threads", async () => {
        userLoggedIn = await login(user.name, user.password, user.mnemonic);
        expect(userLoggedIn.name).toBe(user.name);
    });

    it("create a thread", async () => {
        const message: string = "It's pretty neat that this forum is powered by a blockchain";
        await createThread(userLoggedIn, message);
    });

    it("get thread created by the user", async () => {
        const threads: Thread[] = await getThreadsByUserIdPriorToTimestamp(userLoggedIn.name, Date.now());
        thread = threads[0];
    });

    it("reply to thread", async () => {
        await createSubThread(userLoggedIn, thread.id, thread.author, "This is a reply!");
    });

    it("get thread replies", async () => {
        const threads: Thread[] = await getSubThreadsByParentId(thread.id);
        expect(threads.length).toBe(1);
    });

    it("star rate thread", async () => {
        await starRate(userLoggedIn, thread.id);
        const usersWhoRated: string[] = await getThreadStarRating(thread.id);
        expect(usersWhoRated.length).toBe(1);
    });

    it("remove star rate on thread", async () => {
        await removeStarRate(userLoggedIn, thread.id);
        const usersWhoRated: string[] = await getThreadStarRating(thread.id);
        expect(usersWhoRated.length).toBe(0);
    });

    it("get threads after timestamp", async () => {
        const message: string = "It is fun to program in Rell";
        await createThread(userLoggedIn, message);
        const threads: Thread[] = await getThreadsAfter(Date.now() - 30000);
        expect(threads.length).toBeGreaterThan(0);
    });

    it("get threads prior to timestamp", async () => {
        const message: string = "Rell makes using a blockchain so easy";
        await createThread(userLoggedIn, message);
        const threads: Thread[] = await getThreadsPriorTo(Date.now() + 30000);
        expect(threads.length).toBeGreaterThan(0);
    });

    it("get thread by id", async () => {
        const fetchedThread: Thread = await getThreadById(thread.id);
        expect(thread.message).toBe(fetchedThread.message);
    });

});