import * as bip39 from "bip39";
import { register, login } from "../src/blockchain/UserService";
import { User, Thread } from "../src/types";
import { createThread, getThreadsByUserIdPriorToTimestamp, getThreadsByTagPriorToTimestamp } from "../src/blockchain/MessageService";
import { getTrendingTags, storeTagsFromThread } from "../src/blockchain/TagService";
import { getANumber, sleepUntil } from "./helper";

jest.setTimeout(60000);

describe("thread tagging tests", () => {

    const user = {
        name: "anastasia_" + getANumber(),
        password: "nastya",
        mnemonic: bip39.generateMnemonic(160)
    }

    var loggedInUser: User;

    it("register and login user to use", async () => {
        await register(user.name, user.password, user.mnemonic);
        loggedInUser = await login(user.name, user.password, user.mnemonic);
    });

    it("create thread with tag", async () => {
        await createThread(loggedInUser, "Hello #world");
        const userThreads: Thread[] = await getThreadsByUserIdPriorToTimestamp(loggedInUser.name, Date.now())
        sleepUntil(Date.now() + 10000);
        const threads: Thread[] = await getThreadsByTagPriorToTimestamp("world", Date.now() + 3000);
        expect(threads.length).toBe(1);

        const trendingTags: string[] = await getTrendingTags(1);
        expect(trendingTags.length).toBe(1);
    });

});