import {
  AddUserToChatAction,
  ChatActionTypes,
  CountUnreadChatsAction,
  CreateChatKeyPairAction,
  CreateNewChatAction,
  DeleteChatUserAction,
  LeaveChatAction,
  LoadChatUsersAction,
  LoadUserChatsAction,
  MarkChatAsReadAction,
  ModifyTitleAction,
  OpenChatAction,
  RefreshOpenChatAction,
  SendMessageAction
} from "./chatTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import {
  decrypt,
  encrypt,
  generateRSAKey,
  makeKeyPair,
  rsaDecrypt,
  rsaEncrypt,
  rsaKeyToPubKey
} from "../../../blockchain/CryptoService";
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
  sendChatMessage
} from "../../../blockchain/ChatService";
import {
  countUnreadChatsAction,
  loadUserChats,
  openChat,
  refreshOpenChat,
  sendMessage,
  storeChatKeyPair,
  storeChatParticipants,
  storeChatUsersAction,
  storeDecryptedChat,
  storeErrorMessage,
  storeUnreadChatsCountAction,
  storeUserChats
} from "./chatActions";
import { uniqueId } from "../../../util/util";
import { ApplicationState } from "../../../store";
import { Chat, ChatMessage, ChatMessageDecrypted } from "../../../types";
import { getChatPassphrase, storeChatPassphrase } from "../../../util/user-util";
import logger from "../../../util/logger";

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
  logger.silly("[SAGA - STARTED]: Check chat authentication");
  const rsaKey = yield select(getRsaKey);

  if (rsaKey == null) {
    const rsaPassphrase = getChatPassphrase();

    if (rsaPassphrase != null) {
      const reconstructedRSAKey = generateRSAKey(rsaPassphrase);
      yield put(storeChatKeyPair(reconstructedRSAKey, true));
    }
  }

  logger.silly("[SAGA - FINISHED]: Check chat authentication");
}

export function* createChatKeyPairSaga(action: CreateChatKeyPairAction) {
  logger.silly("[SAGA - STARTED]: Creating chat key pair");
  const pubKey: string = yield getUserPubKey(action.user.name);

  const rsaKey = generateRSAKey(action.password);
  const rsaPubKey = rsaKeyToPubKey(rsaKey);

  if (pubKey != null && pubKey !== rsaPubKey) {
    logger.info("New pubkey didn't match old one");
    yield put(storeErrorMessage("Incorrect passphrase"));
    return;
  } else if (pubKey == null) {
    yield createChatUser(action.user, rsaPubKey);
  }

  storeChatPassphrase(action.password);
  yield put(storeChatKeyPair(rsaKey, true));
  logger.silly("[SAGA - FINISHED]: Creating chat key pair");
}

export function* createNewChatSaga(action: CreateNewChatAction) {
  logger.silly("[SAGA - STARTED]: Create new chat");
  const id = uniqueId();

  const sharedChatKey = makeKeyPair().privKey;

  const rsaKey = yield select(getRsaKey);
  const rsaPubKey = rsaKeyToPubKey(rsaKey);
  const encryptedSharedChatKey = yield rsaEncrypt(sharedChatKey.toString("hex"), rsaPubKey);

  yield createNewChat(action.user, id, encryptedSharedChatKey.cipher);
  yield put(loadUserChats(action.user, true));
  logger.silly("[SAGA - FINISHED]: Create new chat");
}

export function* addUserToChatSaga(action: AddUserToChatAction) {
  logger.silly("[SAGA - STARTED]: Add user to chat");
  const chatParticipants = yield select(getActiveChatParticipants);

  if (chatParticipants == null || !chatParticipants.includes(action.username)) {
    const targetUserPubKey = yield getUserPubKey(action.username);

    if (targetUserPubKey != null) {
      const chat = yield select(getActiveChat);
      const rsaKey = yield select(getRsaKey);

      const decryptedChatKey = yield rsaDecrypt(chat.encrypted_chat_key, rsaKey);
      const encryptedSharedChatKey = yield rsaEncrypt(decryptedChatKey.plaintext, targetUserPubKey);

      yield addUserToChat(action.user, chat.id, action.username, encryptedSharedChatKey.cipher);
      yield put(sendMessage(action.user, chat, "I invited '" + action.username + "' to join us."));
    } else {
      logger.info("User [%s] hasn't created a chat key yet", action.username);
    }
  }
  logger.silly("[SAGA - FINISHED]: Add user to chat");
}

export function* leaveChatSaga(action: LeaveChatAction) {
  logger.silly("[SAGA - STARTED]: Leave chat");
  const chat = yield select(getActiveChat);

  yield leaveChat(action.user, chat.id);
  yield put(loadUserChats(action.user, true));
  logger.silly("[SAGA - FINISHED]: Leave chat");
}

export function* loadUserChatsSaga(action: LoadUserChatsAction) {
  logger.silly("[SAGA - STARTED]: Load user chats");
  const lastUpdate = yield select(getLastUpdate);

  if (action.force || shouldUpdate(lastUpdate)) {
    const chats: Chat[] = yield getUserChats(action.user.name);
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
        yield put(openChat(chats[0], action.user));
      }
    }
  }

  logger.silly("[SAGA - FINISHED]: Load user chats");
}

export function* openChatSaga(action: OpenChatAction) {
  logger.silly("[SAGA - STARTED]: Open chat");
  if (action.chat != null) {
    const chatMessages = yield getChatMessages(action.chat.id, Date.now(), PAGE_SIZE);
    const rsaKey = yield select(getRsaKey);
    const sharedChatKey: any = yield rsaDecrypt(action.chat.encrypted_chat_key, rsaKey);

    const decryptedMessages: ChatMessageDecrypted[] = decryptMessages(rsaKey, sharedChatKey, chatMessages);

    const participants = yield getChatParticipants(action.chat.id);
    const couldExistOlder = yield select(couldExistOlderMessages);

    yield put(storeChatParticipants(participants));
    yield put(
      storeDecryptedChat(
        action.chat,
        decryptedMessages,
        determineCouldExistOlderMessages(decryptedMessages.length, couldExistOlder)
      )
    );

    yield markChatAsRead(action.user, action.chat.id);
    yield put(countUnreadChatsAction(action.user));
  } else {
    yield put(storeDecryptedChat(null, []));
  }

  logger.silly("[SAGA - FINISHED]: Open chat");
}

export function* refreshOpenChatSaga(action: RefreshOpenChatAction) {
  logger.silly("[SAGA - STARTED]: Refresh open chat");
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

    const decryptedMessages: ChatMessageDecrypted[] = decryptMessages(rsaKey, sharedChatKey, chatMessages);

    if (decryptedMessages.length > 0) {
      const participants = yield getChatParticipants(chat.id);

      yield put(storeChatParticipants(participants));
      const couldExistOlder = yield select(couldExistOlderMessages);
      yield put(
        storeDecryptedChat(
          chat,
          previousMessages.concat(decryptedMessages),
          determineCouldExistOlderMessages(decryptedMessages.length, couldExistOlder)
        )
      );

      if (chatMessages.length > previousMessages.length) {
        yield markChatAsRead(action.user, chat.id).catch();
      }

      yield put(loadUserChats(action.user, true));
      yield put(countUnreadChatsAction(action.user));
    }
  }

  yield put(loadUserChats(action.user, false));

  logger.silly("[SAGA - FINISHED]: Refresh open chat");
}

export function* sendMessageSaga(action: SendMessageAction) {
  logger.silly("[SAGA - STARTED]: Send message");
  const rsaKey = yield select(getRsaKey);
  const sharedChatKey: any = yield rsaDecrypt(action.chat.encrypted_chat_key, rsaKey);

  yield sendChatMessage(action.user, action.chat.id, encrypt(action.message, sharedChatKey.plaintext));
  yield put(refreshOpenChat(action.user));

  logger.silly("[SAGA - FINISHED]: Send message");
}

export function* modifyTitleSaga(action: ModifyTitleAction) {
  logger.silly("[SAGA - STARTED]: Modify title");
  yield modifyTitle(action.user, action.chat.id, action.title);
  const updatedChat: Chat = {
    id: action.chat.id,
    title: action.title,
    encrypted_chat_key: action.chat.encrypted_chat_key,
    timestamp: action.chat.timestamp,
    last_message: action.chat.last_message,
    last_opened: action.chat.last_opened
  };
  yield put(openChat(updatedChat, action.user));
  yield put(loadUserChats(action.user, true));

  logger.silly("[SAGA - FINISHED]: Modify title");
}

export function* loadChatUsersSaga(action: LoadChatUsersAction) {
  logger.silly("[SAGA - STARTED]: Load chat users");
  const lastUpdated = yield select(getChatUsersLastUpdate);

  if (shouldUpdate(lastUpdated)) {
    const followedChatUsers = yield getFollowedChatUsers(action.user.name);
    const chatUsers = yield getChatUsers();

    yield put(storeChatUsersAction(followedChatUsers, chatUsers));
  }

  logger.silly("[SAGA - FINISHED]: Load chat users");
}

export function* deleteChatUserSaga(action: DeleteChatUserAction) {
  logger.silly("[SAGA - STARTED]: Delete chat user");
  yield deleteChatUser(action.user);
  logger.silly("[SAGA - FINISHED]: Delete chat user");
}

export function* loadOlderMessagesSaga() {
  logger.silly("[SAGA - STARTED]: Load older messages");
  const messages: ChatMessageDecrypted[] = yield select(getActiveChatMessages);

  if (messages != null && messages.length >= PAGE_SIZE) {
    const chat = yield select(getActiveChat);

    const encOlderMessages = yield getChatMessages(chat.id, messages[0].timestamp, PAGE_SIZE);
    const rsaKey = yield select(getRsaKey);
    const sharedChatKey: any = yield rsaDecrypt(chat.encrypted_chat_key, rsaKey);

    const decryptedMessages = decryptMessages(rsaKey, sharedChatKey, encOlderMessages);
    const couldExistOlder = yield select(couldExistOlderMessages);

    yield put(
      storeDecryptedChat(
        chat,
        decryptedMessages.concat(messages),
        determineCouldExistOlderMessages(decryptedMessages.length, couldExistOlder)
      )
    );
  } else {
    logger.debug(
      "Messages [%s] are less than pageSize [%s], there shouldn't be any older messages",
      messages.length,
      PAGE_SIZE
    );
  }

  logger.silly("[SAGA - FINISHED]: Load older messages");
}

export function* countUnreadChatsSaga(action: CountUnreadChatsAction) {
  logger.silly("[SAGA - STARTED]: Count unread chats: " + action);
  if (action.user != null) {
    const count = yield countUnreadChats(action.user.name).catch(() => (window.location.href = "/user/logout"));
    yield put(storeUnreadChatsCountAction(count));
  }

  logger.silly("[SAGA - FINISHED]: Count unread chats");
}

export function* markChatAsReadSaga(action: MarkChatAsReadAction) {
  logger.silly("[SAGA - STARTED]: Mark chat as read");
  if (action.user != null) {
    yield markChatAsRead(action.user, action.chat.id);
    yield put(countUnreadChatsAction(action.user));
  }

  logger.silly("[SAGA - FINISHED]: Mark chat as read");
}

function decryptMessages(rsaKey: any, sharedChatKey: any, chatMessages: ChatMessage[]): ChatMessageDecrypted[] {
  return chatMessages.map((message: ChatMessage) => {
    return {
      sender: message.sender,
      timestamp: message.timestamp,
      msg: decrypt(message.encrypted_msg, sharedChatKey.plaintext)
    };
  });
}

function determineCouldExistOlderMessages(nrOfMessages: number, prevCouldExistOlderState: boolean): boolean {
  return nrOfMessages === 0 ? prevCouldExistOlderState : nrOfMessages >= PAGE_SIZE;
}

function arraysEqual(arr1: Chat[], arr2: Chat[]) {
  if (arr1.length !== arr2.length) return false;
  for (var i = arr1.length; i--; ) {
    if (arr1[i].id !== arr2[i].id) return false;
  }

}
