import { Chat, ChromunityUser } from "../../../src/types";
import { CREATE_LOGGED_IN_USER } from "../../users";
import {
  ChatActions,
  ChatActionTypes,
  OpenChatAction,
  StoreChatKeyPairAction
} from "../../../src/components/chat/redux/chatTypes";
import { runSaga } from "redux-saga";
import {
  addUserToChatSaga,
  createChatKeyPairSaga,
  createNewChatSaga, leaveChatSaga,
  loadUserChatsSaga
} from "../../../src/components/chat/redux/chatSagas";

describe("Chat Sagas test", () => {
  jest.setTimeout(30000);

  const PASSWORD_1 = "password1";
  const PASSWORD_2 = "password2";

  let chatUser1: ChromunityUser;
  let chatUser2: ChromunityUser;

  let chatUser1RsaKey: any;
  let chatUser2RsaKey: any;

  let chat: Chat;

  const createFakeStore = (dispatchedActions: ChatActions[], state: any) => {
    return {
      dispatch: (action: ChatActions) => dispatchedActions.push(action),
      getState: () => ({ chat: state })
    };
  };

  const createKeyPair = async (user: ChromunityUser, passphrase: string) => {
    const dispatchedChatActions: ChatActions[] = [];
    const fakeStore = createFakeStore(dispatchedChatActions, {});

    // Create and retrieve RSA KeyPair for the first user
    await runSaga(fakeStore, createChatKeyPairSaga, {
      type: ChatActionTypes.CREATE_CHAT_KEY_PAIR,
      user: chatUser1,
      password: PASSWORD_1
    }).toPromise();

    expect(dispatchedChatActions.length).toBe(1);
    let action = dispatchedChatActions[0];
    let keyPairAction = action as StoreChatKeyPairAction;
    return keyPairAction.rsaKey;
  };

  const createChat = async (rsaKey: any, user: ChromunityUser) => {
    const dispatchedChatActions: ChatActions[] = [];
    const fakeStore = createFakeStore(dispatchedChatActions, {
      rsaKey: rsaKey
    });

    // Create and retrieve RSA KeyPair for the first user
    await runSaga(fakeStore, createNewChatSaga, {
      type: ChatActionTypes.CREATE_NEW_CHAT,
      user: user
    }).toPromise();

    await runSaga(fakeStore, loadUserChatsSaga, {
      type: ChatActionTypes.LOAD_USER_CHATS,
      user: user,
      force: true
    }).toPromise();

    expect(dispatchedChatActions.length).toBe(3);
    let action = dispatchedChatActions[2];
    let openChatsAction = action as OpenChatAction;
    return openChatsAction.chat;
  };

  const inviteUserToChat = async (chatOwnerRsaKey: any, chatOwner: ChromunityUser, chat: Chat, username: string) => {
    const dispatchedChatActions: ChatActions[] = [];
    const fakeStore = createFakeStore(dispatchedChatActions, {
      rsaKey: chatOwnerRsaKey,
      activeChat: chat
    });

    await runSaga(fakeStore, addUserToChatSaga, {
      type: ChatActionTypes.ADD_USER_TO_CHAT,
      username: username,
      user: chatOwner
    }).toPromise();
  };

  beforeAll(async () => {
    chatUser1 = await CREATE_LOGGED_IN_USER();
    chatUser2 = await CREATE_LOGGED_IN_USER();

    chatUser1RsaKey = await createKeyPair(chatUser1, PASSWORD_1);
    chatUser2RsaKey = await createKeyPair(chatUser2, PASSWORD_2);

    chat = await createChat(chatUser1RsaKey, chatUser1);
    await inviteUserToChat(chatUser1RsaKey, chatUser1, chat, chatUser2.name);
  });

  it("Create and leave chat", async () => {
    const newChat = await createChat(chatUser1RsaKey, chatUser1);

    const dispatchedChatActions: ChatActions[] = [];
    const fakeStore = createFakeStore(dispatchedChatActions, {
      rsaKey: chatUser1RsaKey,
      activeChat: newChat
    });

    await runSaga(fakeStore, leaveChatSaga, {
      type: ChatActionTypes.LEAVE_CHAT,
      user: chatUser1
    }).toPromise();
  });
});
