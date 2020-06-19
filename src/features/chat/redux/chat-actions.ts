import {
  ChatActionTypes,
  ICreateChatKeyPair,
  IAddUserToChat,
  ILoadUserChats,
  IOpenChat,
  IStoreDecryptedChat,
  ISendMessage,
  IStoreChatUsers,
  IMarkChatAsRead,
  IModifyTitle
} from "./chat-types";
import { Chat, ChromunityUser } from "../../../types";
import { createAction } from "@reduxjs/toolkit";
import { withPayloadType } from "../../../shared/redux/util";

export const checkChatAuthentication = createAction(ChatActionTypes.CHECK_CHAT_AUTH_ACTION);

export const createChatKeyPair = createAction(ChatActionTypes.CREATE_CHAT_KEY_PAIR, withPayloadType<ICreateChatKeyPair>());

export const storeChatKeyPair = createAction(ChatActionTypes.STORE_CHAT_KEY_PAIR, withPayloadType<string>());

export const createNewChat = createAction(ChatActionTypes.CREATE_NEW_CHAT, withPayloadType<ChromunityUser>());

export const addUserToChat = createAction(ChatActionTypes.ADD_USER_TO_CHAT, withPayloadType<IAddUserToChat>());

export const leaveChat = createAction(ChatActionTypes.LEAVE_CHAT, withPayloadType<ChromunityUser>());

export const loadUserChats = createAction(ChatActionTypes.LOAD_USER_CHATS, withPayloadType<ILoadUserChats>());

export const storeUserChats = createAction(ChatActionTypes.STORE_USER_CHATS, withPayloadType<Chat[]>());

export const openChat = createAction(ChatActionTypes.OPEN_CHAT, withPayloadType<IOpenChat>());

export const refreshOpenChat = createAction(ChatActionTypes.REFRESH_OPEN_CHAT, withPayloadType<ChromunityUser>());

export const storeDecryptedChat = createAction(ChatActionTypes.STORE_DECRYPTED_CHAT, withPayloadType<IStoreDecryptedChat>());

export const storeChatParticipants = createAction(ChatActionTypes.STORE_CHAT_PARTICIPANTS, withPayloadType<string[]>());

export const sendMessage = createAction(ChatActionTypes.SEND_MESSAGE, withPayloadType<ISendMessage>());

export const modifyTitle = createAction(ChatActionTypes.MODIFY_TITLE, withPayloadType<IModifyTitle>());

export const loadChatUsers = createAction(ChatActionTypes.LOAD_CHAT_USERS, withPayloadType<ChromunityUser>());

export const storeChatUsers = createAction(ChatActionTypes.STORE_CHAT_USERS, withPayloadType<IStoreChatUsers>());

export const loadOlderMessages = createAction(ChatActionTypes.LOAD_OLDER_MESSAGES);

export const deleteChatUser = createAction(ChatActionTypes.DELETE_CHAT_USER, withPayloadType<ChromunityUser>());

export const countUnreadChats = createAction(ChatActionTypes.COUNT_UNREAD_CHATS, withPayloadType<ChromunityUser>());

export const storeUnreadChatsCount = createAction(ChatActionTypes.STORE_UNREAD_CHATS_COUNT, withPayloadType<number>());

export const markChatAsRead = createAction(ChatActionTypes.MARK_CHAT_AS_READ, withPayloadType<IMarkChatAsRead>());
