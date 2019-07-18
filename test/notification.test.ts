import { User, UserNotification, Topic } from '../src/types';
import { getANumber } from './helper';

import * as bip39 from "bip39";
import { register, login } from '../src/blockchain/UserService';
import { sendNotifications, countUnreadUserNotifications, markNotificationsRead, getUserNotifications } from '../src/blockchain/NotificationService';
import { createTopic, getTopicsByUserPriorToTimestamp } from '../src/blockchain/TopicService';

jest.setTimeout(30000);

describe("notification tests", () => {

    const user = {
        name: "snieking_" + getANumber(),
        password: "userPSW1",
        mnemonic: bip39.generateMnemonic(160)
    };

    const user2 = {
        name: "snieking_" + getANumber(),
        password: "userPSW1",
        mnemonic: bip39.generateMnemonic(160)
    };

    var loggedInUser: User;
    var secondLoggedInUser: User;
    var topic: Topic;

    it("register first user to use for notifications", async () => {
        await register(user.name, user.password, user.mnemonic);
    });

    it("register second user to use for notifications", async () => {
        await register(user2.name, user2.password, user2.mnemonic);
    });

    it("login first user to use for notifications", async () => {
        loggedInUser = await login(user.name, user.password, user.mnemonic);
        expect(loggedInUser.name).toBe(user.name);
    });

    it("login second user to use for notifications", async () => {
        secondLoggedInUser = await login(user2.name, user2.password, user2.mnemonic);
        expect(secondLoggedInUser.name).toBe(user2.name);
    });

    it("send notification, expect unread to be 1", async () => {
        await sendNotifications(secondLoggedInUser, "test", "test", [loggedInUser.name]);
        const count: number = await countUnreadUserNotifications(loggedInUser.name);
        expect(count).toBe(1);
    });

    it("mark notifications read, expect unread to be 0", async () => {
        await markNotificationsRead(loggedInUser);
        const count: number = await countUnreadUserNotifications(loggedInUser.name);
        expect(count).toBe(0);
    });

    it("retrieve notifications, expect 1", async () => {
        const notifiactions: UserNotification[] = await getUserNotifications(loggedInUser.name);
        expect(notifiactions.length).toBe(1);
    });

});