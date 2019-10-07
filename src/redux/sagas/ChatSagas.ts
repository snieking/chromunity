import {
  AddUserToChatAction,
  ChatActionTypes,
  CreateChatKeyPairAction,
  CreateNewChatAction, LeaveChatAction,
  LoadUserChatsAction,
  OpenChatAction,
  RefreshOpenChatAction,
  SendMessageAction
} from "../ChatTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import {
  decrypt,
  encrypt,
  generateRSAKey,
  makeKeyPair,
  rsaDecrypt,
  rsaEncrypt,
  rsaKeyToPubKey
} from "../../blockchain/CryptoService";
import {
  addUserToChat,
  createChatUser,
  createNewChat,
  getChatMessages,
  getUserChats,
  getUserPubKey, leaveChat,
  sendChatMessage
} from "../../blockchain/ChatService";
import {
  loadUserChats,
  openChat,
  refreshOpenChat,
  storeChatKeyPair,
  storeDecryptedChat,
  storeUserChats
} from "../actions/ChatActions";
import { uniqueId } from "../../util/util";
import { ApplicationState } from "../Store";
import { Chat, ChatMessage, ChatMessageDecrypted } from "../../types";
import { getChatPassphrase, storeChatPassphrase } from "../../util/user-util";

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
}

export const getRsaKey = (state: ApplicationState) => state.chat.rsaKey;
export const getChats = (state: ApplicationState) => state.chat.chats;
export const getActiveChat = (state: ApplicationState) => state.chat.activeChat;
export const getActiveChatMessages = (state: ApplicationState) => state.chat.activeChatMessages;
export const getLastUpdate = (state: ApplicationState) => state.chat.lastUpdate;

const UPDATE_DURATION_MILLIS = 1000 * 60;

const shouldUpdate = (updated: number): boolean => {
  console.log("Last updated: ", updated);
  return Date.now() - updated > UPDATE_DURATION_MILLIS;
};

export function* checkChatAuthenticationSaga() {
  console.log("CHecking auth");

  const rsaKey = yield select(getRsaKey);
  console.log("RSA Key from Redux: ", rsaKey);

  if (rsaKey == null) {
    const rsaPassphrase = getChatPassphrase();
    console.log("RSA Passphrase from Local Storage: ", rsaPassphrase);

    if (rsaPassphrase != null) {
      console.log("Fetched from localStorage");
      const reconstructedRSAKey = generateRSAKey(rsaPassphrase);
      yield put(storeChatKeyPair(reconstructedRSAKey, true));
    }
  }
}

export function* createChatKeyPairSaga(action: CreateChatKeyPairAction) {
  const pubKey: string = yield getUserPubKey(action.user.name);

  const rsaKey = generateRSAKey(action.password);
  console.log("rsaKey: ", rsaKey.toJSON());
  const rsaPubKey = rsaKeyToPubKey(rsaKey);
  console.log("RSA PubKey: ", rsaPubKey);

  if (pubKey != null && pubKey !== rsaPubKey) {
    console.log("New pubkey didn't match old one");
    return;
  } else if (pubKey == null) {
    yield createChatUser(action.user, rsaPubKey);
  }

  storeChatPassphrase(action.password);
  yield put(storeChatKeyPair(rsaKey, true));
}

export function* createNewChatSaga(action: CreateNewChatAction) {
  const id = uniqueId();
  console.log("Id on new chat: ", id);

  const sharedChatKey = makeKeyPair().privKey;
  console.log("Chat key", sharedChatKey.toString("hex"));

  const rsaKey = yield select(getRsaKey);
  const rsaPubKey = rsaKeyToPubKey(rsaKey);
  const encryptedSharedChatKey = yield rsaEncrypt(sharedChatKey.toString("hex"), rsaPubKey);

  yield createNewChat(action.user, id, encryptedSharedChatKey.cipher);
  yield put(loadUserChats(action.user.name, true));
}

export function* addUserToChatSaga(action: AddUserToChatAction) {
  const targetUserPubKey = yield getUserPubKey(action.username);

  if (targetUserPubKey != null) {
    const chat = yield select(getActiveChat);
    const rsaKey = yield select(getRsaKey);

    const decryptedChatKey = yield rsaDecrypt(chat.encrypted_chat_key, rsaKey);
    const encryptedSharedChatKey = yield rsaEncrypt(decryptedChatKey.plaintext, targetUserPubKey);

    yield addUserToChat(action.user, chat.id, action.username, encryptedSharedChatKey.cipher);
  } else {
    console.log("User hasn't created a chat key yet", action.username);
  }
}

export function* leaveChatSaga(action: LeaveChatAction) {
  const chat = yield select(getActiveChat);

  yield leaveChat(action.user, chat.id);
  yield put(loadUserChats(action.user.name, true));
}

export function* loadUserChatsSaga(action: LoadUserChatsAction) {
  const lastUpdate = yield select(getLastUpdate);

  if (action.force || shouldUpdate(lastUpdate)) {
    console.log("Load user chats: ", action);
    const chats: Chat[] = yield getUserChats(action.user);
    const prevChats: Chat[] = yield select(getChats);
    console.log("Chats: ", chats);
    if (!arraysEqual(chats, prevChats)) {
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
        yield put(openChat(chats[0]));
      }
    }
  }
}

export function* openChatSaga(action: OpenChatAction) {
  if (action.chat != null) {
    const chatMessages = yield getChatMessages(action.chat.id);
    const rsaKey = yield select(getRsaKey);
    const sharedChatKey: any = yield rsaDecrypt(action.chat.encrypted_chat_key, rsaKey);

    const decryptedMessages: ChatMessageDecrypted = chatMessages.map((message: ChatMessage) => {
      return {
        sender: message.sender,
        timestamp: message.timestamp,
        msg: decrypt(message.encrypted_msg, sharedChatKey.plaintext)
      };
    });

    yield put(storeDecryptedChat(action.chat, decryptedMessages));
  } else {
    yield put(storeDecryptedChat(null, []));
  }
}

export function* refreshOpenChatSaga(action: RefreshOpenChatAction) {
  const chat = yield select(getActiveChat);
  console.log("Refreshing open chat", chat);

  if (chat != null) {
    const prevMessages = yield select(getActiveChatMessages);
    const chatMessages = yield getChatMessages(chat.id);

    if (chatMessages.length > prevMessages.length) {
      const rsaKey = yield select(getRsaKey);
      const sharedChatKey: any = yield rsaDecrypt(chat.encrypted_chat_key, rsaKey);


      const decryptedMessages: ChatMessageDecrypted = chatMessages.map((message: ChatMessage) => {
        console.log("Message: ", message);
        return {
          sender: message.sender,
          timestamp: message.timestamp,
          msg: decrypt(message.encrypted_msg, sharedChatKey.plaintext)
        };
      });

      yield put(storeDecryptedChat(chat, decryptedMessages));
      yield put(loadUserChats(action.user, true));
    }
  }
}

export function* sendMessageSaga(action: SendMessageAction) {
  console.log("Sending chat message: ", action);
  const rsaKey = yield select(getRsaKey);
  console.log("Retrieved RSA key: ", rsaKey);
  const sharedChatKey: any = yield rsaDecrypt(action.chat.encrypted_chat_key, rsaKey);
  console.log("Retrieved shared chat key: ", sharedChatKey);

  yield sendChatMessage(action.user, action.chat.id, encrypt(action.message, sharedChatKey.plaintext));
  console.log("Sent message");
  yield put(refreshOpenChat(action.user.name));
  console.log("Refresh chat");
}

function arraysEqual(arr1: Chat[], arr2: Chat[]) {
  if (arr1.length !== arr2.length) return false;
  for (var i = arr1.length; i--; ) {
    if (arr1[i].id !== arr2[i].id) return false;
  }

  return true;
}
