import { ActionCreator } from "redux";
import {
  AddUserToChatAction,
  ChatActionTypes, CheckChatAuthenticationAction,
  CreateChatKeyPairAction,
  CreateNewChatAction, LeaveChatAction,
  LoadUserChatsAction,
  OpenChatAction, RefreshOpenChatAction, SendMessageAction,
  StoreChatKeyPairAction,
  StoreDecryptedChatAction,
  StoreUserChatsAction
} from "../ChatTypes";
import { Chat, ChatMessageDecrypted, ChromunityUser } from "../../types";

export const checkChatAuthentication: ActionCreator<CheckChatAuthenticationAction> = () => ({
  type: ChatActionTypes.CHECK_CHAT_AUTH_ACTION
});

export const createChatKeyPair: ActionCreator<CreateChatKeyPairAction> = (user: ChromunityUser, password: string) => ({
  type: ChatActionTypes.CREATE_CHAT_KEY_PAIR,
  user: user,
  password: password
});

export const storeChatKeyPair: ActionCreator<StoreChatKeyPairAction> = (rsaKey: any) => ({
  type: ChatActionTypes.STORE_CHAT_KEY_PAIR,
  rsaKey: rsaKey
});

export const createNewChat: ActionCreator<CreateNewChatAction> = (user: ChromunityUser) => ({
  type: ChatActionTypes.CREATE_NEW_CHAT,
  user: user
});

export const addUserToChatAction: ActionCreator<AddUserToChatAction> = (username: string, user: ChromunityUser) => ({
  type: ChatActionTypes.ADD_USER_TO_CHAT,
  username: username,
  user: user
});

export const leaveChatAction: ActionCreator<LeaveChatAction> = (user: ChromunityUser) => ({
  type: ChatActionTypes.LEAVE_CHAT,
  user: user
});

export const loadUserChats: ActionCreator<LoadUserChatsAction> = (user: string, force?: boolean) => ({
  type: ChatActionTypes.LOAD_USER_CHATS,
  user: user,
  force: force
});

export const storeUserChats: ActionCreator<StoreUserChatsAction> = (chats: Chat[]) => ({
  type: ChatActionTypes.STORE_USER_CHATS,
  chats: chats
});

export const openChat: ActionCreator<OpenChatAction> = (chat: Chat) => ({
  type: ChatActionTypes.OPEN_CHAT,
  chat: chat
});

export const refreshOpenChat: ActionCreator<RefreshOpenChatAction> = (user: string) => ({
  type: ChatActionTypes.REFRESH_OPEN_CHAT,
  user: user
});

export const storeDecryptedChat: ActionCreator<StoreDecryptedChatAction> = (
  chat: Chat,
  messages: ChatMessageDecrypted[]
) => ({
  type: ChatActionTypes.STORE_DECRYPTED_CHAT,
  chat: chat,
  messages: messages
});

export const sendMessage: ActionCreator<SendMessageAction> = (user: ChromunityUser, chat: Chat, message: string) => ({
  type: ChatActionTypes.SEND_MESSAGE,
  user: user,
  chat: chat,
  message: message
});
