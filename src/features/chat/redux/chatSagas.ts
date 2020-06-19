import { setRateLimited, setQueryPending, setOperationPending } from "./../../../shared/redux/CommonActions";
import { notifyError, notifySuccess } from "../../../core/snackbar/redux/snackbarActions";
import {
  ChatActionTypes,
} from "./chatTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import {
  decrypt,
  encrypt,
  generateRSAKey,
  makeKeyPair,
  rsaDecrypt,
  rsaEncrypt,
  rsaKeyToPubKey,
} from "../../../core/services/CryptoService";
import {
  addUserToChat,
  countUnreadChats,
  createChatUser,
  createNewChat,
  deleteChatUser,
  getChatMessages,
  getChatMessagesAfterTimestamp,
  getChatParticipants,
  getChatUsers,
  getFollowedChatUsers,
  getUserChats,
  getUserPubKey,
  leaveChat,
  markChatAsRead,
  modifyTitle,
  sendChatMessage,
} from "../../../core/services/ChatService";
import {
  addUserToChat as addUserToChatAction,
  countUnreadChats as countUnreadChatsAction,
  deleteChatUser as deleteChatUserAction,
  leaveChat as leaveChatAction,
  loadUserChats,
  modifyTitle as modifyTitleAction,
  markChatAsRead as markChatAsReadAction,
  openChat,
  sendMessage,
  storeChatKeyPair,
  storeChatParticipants,
  storeDecryptedChat,
  storeUserChats,
  createChatKeyPair,
  createNewChat as createNewChatAction,
  refreshOpenChat,
  storeChatUsers,
  storeUnreadChatsCount as storeUnreadChatsCountAction
} from "./chatActions";
import { uniqueId } from "../../../shared/util/util";
import ApplicationState from "../../../core/application-state";
import { Chat, ChatMessage, ChatMessageDecrypted } from "../../../types";
import { getChatPassphrase, storeChatPassphrase } from "../../../shared/util/user-util";
import logger from "../../../shared/util/logger";
import { chatEvent } from "../../../shared/util/matomo";
import { Action } from "redux";

export function* chatWatcher() {
  yield takeLatest(ChatActionTypes.CHECK_CHAT_AUTH_ACTION, checkChatAuthenticationSaga);
  yield takeLatest(ChatActionTypes.CREATE_CHAT_KEY_PAIR, createChatKeyPairSaga);
  yield takeLatest(ChatActionTypes.CREATE_NEW_CHAT, createNewChatSaga);
  yield takeLatest(ChatActionTypes.LOAD_USER_CHATS, loadUserChatsSaga);
  yield takeLatest(ChatActionTypes.OPEN_CHAT, openChatSaga);
  yield takeLatest(ChatActionTypes.REFRESH_OPEN_CHAT, refreshOpenChatSaga);
  yield takeLatest(ChatActionTypes.SEND_MESSAGE, sendMessageSaga);
  yield takeLatest(ChatActionTypes.ADD_USER_TO_CHAT, addUserToChatSaga);
  yield takeLatest(ChatActionTypes.LEAVE_CHAT, leaveChatSaga);
  yield takeLatest(ChatActionTypes.MODIFY_TITLE, modifyTitleSaga);
  yield takeLatest(ChatActionTypes.LOAD_CHAT_USERS, loadChatUsersSaga);
  yield takeLatest(ChatActionTypes.LOAD_OLDER_MESSAGES, loadOlderMessagesSaga);
  yield takeLatest(ChatActionTypes.DELETE_CHAT_USER, deleteChatUserSaga);
  yield takeLatest(ChatActionTypes.COUNT_UNREAD_CHATS, countUnreadChatsSaga);
  yield takeLatest(ChatActionTypes.MARK_CHAT_AS_READ, markChatAsReadSaga);
}

const PAGE_SIZE = 50;

export const getRsaKey = (state: ApplicationState) => state.chat.rsaKey;
export const getChats = (state: ApplicationState) => state.chat.chats;
export const getActiveChat = (state: ApplicationState) => state.chat.activeChat;
export const getActiveChatParticipants = (state: ApplicationState) => state.chat.activeChatParticipants;
export const getActiveChatMessages = (state: ApplicationState) => state.chat.activeChatMessages;
export const couldExistOlderMessages = (state: ApplicationState) => state.chat.activeChatCouldExistOlderMessages;
export const getLastUpdate = (state: ApplicationState) => state.chat.lastUpdate;
export const getChatUsersLastUpdate = (state: ApplicationState) => state.chat.chatUsersLastUpdate;

const UPDATE_DURATION_MILLIS = 1000 * 30;

const shouldUpdate = (updated: number): boolean => {
  return Date.now() - updated > UPDATE_DURATION_MILLIS;
};

export function* checkChatAuthenticationSaga() {
  yield put(setQueryPending(true));
  const rsaKey = yield select(getRsaKey);

  if (rsaKey == null) {
    const rsaPassphrase = getChatPassphrase();

    if (rsaPassphrase != null) {
      const reconstructedRSAKey = generateRSAKey(rsaPassphrase);
      yield put(storeChatKeyPair(reconstructedRSAKey));
    }
  }

  yield put(setQueryPending(false));
}

export function* createChatKeyPairSaga(action: Action) {
  if (createChatKeyPair.match(action)) {
    const pubKey: string = yield getUserPubKey(action.payload.user.name);

    const rsaKey = generateRSAKey(action.payload.password);
    const rsaPubKey = rsaKeyToPubKey(rsaKey);

    try {
      yield put(setOperationPending(true));
      if (pubKey != null && pubKey !== rsaPubKey) {
        logger.info("New pubkey didn't match old one");
        yield put(notifyError("Incorrect passphrase"));
        return;
      } else if (pubKey == null) {
        yield createChatUser(action.payload.user, rsaPubKey);
      }

      storeChatPassphrase(action.payload.password);
      yield put(storeChatKeyPair(rsaKey));

      chatEvent("create-key-pair");
    } catch (error) {
      yield put(notifyError(error.message));
      yield put(setRateLimited());
    } finally {
      yield put(setOperationPending(false));
    }
  }
}

export function* createNewChatSaga(action: Action) {
  if (createNewChatAction.match(action)) {
    const id = uniqueId();

    const sharedChatKey = makeKeyPair().privKey;

    const rsaKey = yield select(getRsaKey);
    const rsaPubKey = rsaKeyToPubKey(rsaKey);
    const encryptedSharedChatKey = yield rsaEncrypt(sharedChatKey.toString("hex"), rsaPubKey);

    try {
      yield put(setOperationPending(true));
      yield createNewChat(action.payload, id, encryptedSharedChatKey.cipher);
      yield put(loadUserChats({ user: action.payload, force: true }));

      chatEvent("create");
    } catch (error) {
      yield put(notifyError(error.message));
      yield put(setRateLimited());
    } finally {
      yield put(setOperationPending(false));
    }
  }
}

export function* addUserToChatSaga(action: Action) {
  if (addUserToChatAction.match(action)) {
    const chatParticipants = yield select(getActiveChatParticipants);

    try {
      if (chatParticipants == null || !chatParticipants.includes(action.payload.username)) {
        const targetUserPubKey = yield getUserPubKey(action.payload.username);

        if (targetUserPubKey != null) {
          yield put(setOperationPending(true));
          const chat = yield select(getActiveChat);
          const rsaKey = yield select(getRsaKey);

          const decryptedChatKey = yield rsaDecrypt(chat.encrypted_chat_key, rsaKey);
          const encryptedSharedChatKey = yield rsaEncrypt(decryptedChatKey.plaintext, targetUserPubKey);

          yield addUserToChat(action.payload.user, chat.id, action.payload.username, encryptedSharedChatKey.cipher);
          yield put(sendMessage({ user: action.payload.user, chat, message: "I invited '" + action.payload.username + "' to join us." }));
          chatEvent("invite-user");
        } else {
          logger.info("User [%s] hasn't created a chat key yet", action.payload.username);
        }
      }
    } catch (error) {
      yield put(notifyError(error.message));
      yield put(setRateLimited());
    } finally {
      yield put(setOperationPending(false));
    }
  }
}

export function* leaveChatSaga(action: Action) {
  if (leaveChatAction.match(action)) {
    const chat = yield select(getActiveChat);

    try {
      yield put(setOperationPending(true));
      yield leaveChat(action.payload, chat.id);
      yield put(setOperationPending(false));
      yield put(loadUserChats({ user: action.payload, force: true }));

      chatEvent("leave");
    } catch (error) {
      yield put(notifyError(error.message));
      yield put(setRateLimited());
    }
  }
}

export function* loadUserChatsSaga(action: Action) {
  if (loadUserChats.match(action)) {
    const lastUpdate = yield select(getLastUpdate);

    if (action.payload.force || shouldUpdate(lastUpdate)) {
      yield put(setQueryPending(true));
      const chats: Chat[] = yield getUserChats(action.payload.user.name);
      const prevChats: Chat[] = yield select(getChats);
      if (prevChats == null || !arraysEqual(chats, prevChats)) {
        yield put(
          storeUserChats(
            chats.sort(
              (a: Chat, b: Chat) =>
                (b.last_message != null ? b.last_message.timestamp : b.timestamp) -
                (a.last_message != null ? a.last_message.timestamp : a.timestamp)
            )
          )
        );
      }

      if (chats.length > 0) {
        const activeChat = yield select(getActiveChat);

        if (activeChat == null) {
          yield put(openChat({ chat: chats[0], user: action.payload.user }));
        }
      }

      yield put(setQueryPending(false));
    }
  }
}

export function* openChatSaga(action: Action) {
  if (openChat.match(action)) {
    if (action.payload.chat != null) {
      yield put(setQueryPending(true));
      const chatMessages = yield getChatMessages(action.payload.chat.id, Date.now(), PAGE_SIZE);
      const rsaKey = yield select(getRsaKey);
      const sharedChatKey: any = yield rsaDecrypt(action.payload.chat.encrypted_chat_key, rsaKey);

      const decryptedMessages: ChatMessageDecrypted[] = decryptMessages(sharedChatKey, chatMessages);

      const participants = yield getChatParticipants(action.payload.chat.id);
      const couldExistOlder = yield select(couldExistOlderMessages);

      yield put(storeChatParticipants(participants));
      yield put(
        storeDecryptedChat({
          chat: action.payload.chat,
          messages: decryptedMessages,
          couldExistOlderMessages: determineCouldExistOlderMessages(decryptedMessages.length, couldExistOlder)
        })
      );

      yield markChatAsRead(action.payload.user, action.payload.chat.id);
      yield put(countUnreadChatsAction(action.payload.user));
      yield put(setQueryPending(false));
    } else {
      yield put(storeDecryptedChat({ chat: null, messages: [], couldExistOlderMessages: false }));
    }
  }
}

export function* refreshOpenChatSaga(action: Action) {
  if (refreshOpenChat.match(action)) {
    const chat = yield select(getActiveChat);

    if (chat != null) {
      const previousMessages: ChatMessageDecrypted[] = yield select(getActiveChatMessages);
      const rsaKey = yield select(getRsaKey);
      const sharedChatKey: any = yield rsaDecrypt(chat.encrypted_chat_key, rsaKey);

      let chatMessages: ChatMessage[];
      if (previousMessages != null && previousMessages.length > 0) {
        chatMessages = yield getChatMessagesAfterTimestamp(
          chat.id,
          previousMessages[previousMessages.length - 1].timestamp,
          PAGE_SIZE
        );
      } else {
        chatMessages = yield getChatMessages(chat.id, Date.now(), PAGE_SIZE);
      }

      const decryptedMessages: ChatMessageDecrypted[] = decryptMessages(sharedChatKey, chatMessages);

      if (decryptedMessages.length > 0) {
        const participants = yield getChatParticipants(chat.id);

        yield put(storeChatParticipants(participants));
        const couldExistOlder = yield select(couldExistOlderMessages);

        const newMessages: ChatMessageDecrypted[] = [];
        for (const newMsg of decryptedMessages) {
          for (const prevMsg of previousMessages) {
            if (newMsg.sender === prevMsg.sender && newMsg.msg === prevMsg.msg && prevMsg.inMemory) {
              break;
            }

            newMessages.push(newMsg);
            break;
          }
        }

        yield put(
          storeDecryptedChat({
            chat,
            messages: previousMessages.concat(newMessages),
            couldExistOlderMessages: determineCouldExistOlderMessages(decryptedMessages.length, couldExistOlder)
          })
        );

        yield markChatAsRead(action.payload, chat.id).catch();
        yield put(loadUserChats({ user: action.payload, force: true }));
        yield put(countUnreadChatsAction(action.payload));
      }
    }

    yield put(loadUserChats({ user: action.payload, force: false }));
  }
}

export function* sendMessageSaga(action: Action) {
  if (sendMessage.match(action)) {
    const rsaKey = yield select(getRsaKey);
    const sharedChatKey: any = yield rsaDecrypt(action.payload.chat.encrypted_chat_key, rsaKey);

    try {
      yield put(setOperationPending(true));
      yield sendChatMessage(action.payload.user, action.payload.chat.id, encrypt(action.payload.message, sharedChatKey.plaintext));

      const previousMessages: ChatMessageDecrypted[] = yield select(getActiveChatMessages);
      const msg: ChatMessageDecrypted = {
        sender: action.payload.user.name,
        timestamp: Date.now(),
        msg: action.payload.message,
        inMemory: true,
      };

      const couldExistOlder = yield select(couldExistOlderMessages);
      yield put(storeDecryptedChat({
        chat: action.payload.chat,
        messages: previousMessages.concat([msg]),
        couldExistOlderMessages: couldExistOlder
      }));

      chatEvent("message");
    } catch (error) {
      yield put(notifyError(error.message));
      yield put(setRateLimited());
    } finally {
      yield put(setOperationPending(false));
    }
  }
}

export function* modifyTitleSaga(action: Action) {
  if (modifyTitleAction.match(action)) {
    try {
      yield put(setOperationPending(true));
      yield modifyTitle(action.payload.user, action.payload.chat.id, action.payload.title);

      const updatedChat: Chat = {
        id: action.payload.chat.id,
        title: action.payload.title,
        encrypted_chat_key: action.payload.chat.encrypted_chat_key,
        timestamp: action.payload.chat.timestamp,
        last_message: action.payload.chat.last_message,
        last_opened: action.payload.chat.last_opened,
      };
      yield put(openChat({ chat: updatedChat, user: action.payload.user }));
      yield put(loadUserChats({ user: action.payload.user, force: true }));

      chatEvent("modify-title");
    } catch (error) {
      yield put(notifyError(error.message));
      yield put(setRateLimited());
    } finally {
      yield put(setOperationPending(false));
    }
  }
}

export function* loadChatUsersSaga(action: Action) {
  if (loadUserChats.match(action)) {
    const lastUpdated = yield select(getChatUsersLastUpdate);

    if (shouldUpdate(lastUpdated)) {
      yield put(setQueryPending(true));
      const followedChatUsers = yield getFollowedChatUsers(action.payload.user.name);
      const chatUsers = yield getChatUsers();

      yield put(storeChatUsers({ followedChatUsers, chatUsers }));
      yield put(setQueryPending(false));
    }
  }
}

export function* deleteChatUserSaga(action: Action) {
  if (deleteChatUserAction.match(action)) {
    yield put(setOperationPending(true));
    yield deleteChatUser(action.payload);
    yield put(notifySuccess("Chat account resetted"));
    yield put(setOperationPending(false));

    chatEvent("delete-user");
  }
}

export function* loadOlderMessagesSaga() {
  const messages: ChatMessageDecrypted[] = yield select(getActiveChatMessages);

  if (messages != null && messages.length >= PAGE_SIZE) {
    yield put(setQueryPending(true));
    const chat = yield select(getActiveChat);

    const encOlderMessages = yield getChatMessages(chat.id, messages[0].timestamp, PAGE_SIZE);
    const rsaKey = yield select(getRsaKey);
    const sharedChatKey: any = yield rsaDecrypt(chat.encrypted_chat_key, rsaKey);

    const decryptedMessages = decryptMessages(sharedChatKey, encOlderMessages);
    const couldExistOlder = yield select(couldExistOlderMessages);

    yield put(
      storeDecryptedChat({
        chat,
        messages: decryptedMessages.concat(messages),
        couldExistOlderMessages: determineCouldExistOlderMessages(decryptedMessages.length, couldExistOlder)
      })
    );
    yield put(setQueryPending(false));
  } else {
    logger.debug(
      "Messages [%s] are less than pageSize [%s], there shouldn't be any older messages",
      messages.length,
      PAGE_SIZE
    );
  }
}

export function* countUnreadChatsSaga(action: Action) {
  if (countUnreadChatsAction.match(action) && action.payload != null) {
    const count = yield countUnreadChats(action.payload.name).catch(() => (window.location.href = "/user/logout"));
    yield put(storeUnreadChatsCountAction(count));
  }
}

export function* markChatAsReadSaga(action: Action) {
  if (markChatAsReadAction.match(action) && action.payload.user != null) {
    yield markChatAsRead(action.payload.user, action.payload.chat.id);
    yield put(countUnreadChatsAction(action.payload.user));
  }
}

function decryptMessages(sharedChatKey: any, chatMessages: ChatMessage[]): ChatMessageDecrypted[] {
  return chatMessages.map((message: ChatMessage) => {
    return {
      sender: message.sender,
      timestamp: message.timestamp,
      msg: decrypt(message.encrypted_msg, sharedChatKey.plaintext),
      inMemory: false,
    };
  });
}

function determineCouldExistOlderMessages(nrOfMessages: number, prevCouldExistOlderState: boolean): boolean {
  return nrOfMessages === 0 ? prevCouldExistOlderState : nrOfMessages >= PAGE_SIZE;
}

function arraysEqual(arr1: Chat[], arr2: Chat[]) {
  if (arr1.length !== arr2.length) return false;
  for (var i = arr1.length; i--;) {
    if (arr1[i].id !== arr2[i].id) return false;
  }
}
