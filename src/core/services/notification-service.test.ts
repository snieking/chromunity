import { ChromunityUser, UserNotification } from '../../types';
import {
  countUnreadUserNotifications,
  getUserNotificationsPriorToTimestamp,
  markNotificationsRead,
  removeNotificationsForId,
  sendNotifications,
  sendNotificationWithDeterministicId,
} from './notification-service';
import { createLoggedInUser } from '../../shared/test-utility/users';

jest.setTimeout(30000);

describe('notification tests', () => {
  let loggedInUser: ChromunityUser;
  let secondLoggedInUser: ChromunityUser;

  beforeAll(async () => {
    loggedInUser = await createLoggedInUser();
    secondLoggedInUser = await createLoggedInUser();
  });

  it('send notification, expect unread to be 1', async () => {
    await sendNotifications(secondLoggedInUser, 'test', 'test', [loggedInUser.name]);
    const count: number = await countUnreadUserNotifications(loggedInUser.name);
    expect(count).toBe(1);
  });

  it('mark notifications read, expect unread to be 0', async () => {
    await markNotificationsRead(loggedInUser);
    const count: number = await countUnreadUserNotifications(loggedInUser.name);
    expect(count).toBe(0);
  });

  it('retrieve notifications, expect 1', async () => {
    const notifications: UserNotification[] = await getUserNotificationsPriorToTimestamp(
      loggedInUser.name,
      Date.now(),
      10
    );
    expect(notifications.length).toBe(1);
  });

  it('create & remove deterministic id notification', async () => {
    const id = '1kj103k12';
    await sendNotificationWithDeterministicId(loggedInUser, id, 'Test', '', [secondLoggedInUser.name]);

    let notifications: UserNotification[] = await getUserNotificationsPriorToTimestamp(
      secondLoggedInUser.name,
      Date.now(),
      10
    );
    expect(notifications.length).toBe(1);

    await removeNotificationsForId(loggedInUser, id, [secondLoggedInUser.name]);

    notifications = await getUserNotificationsPriorToTimestamp(secondLoggedInUser.name, Date.now(), 10);
    expect(notifications.length).toBe(0);
  });
});
