import { ActionCreator } from "redux";
import {
  AddUserToChatAction,
  ChatActionTypes,
  CheckChatAuthenticationAction, CountUnreadChatsAction,
  CreateChatKeyPairAction,
  CreateNewChatAction,
  DeleteChatUserAction,
  LeaveChatAction,
  LoadChatUsersAction,
  LoadOlderMessagesAction,
  LoadUserChatsAction, MarkChatAsReadAction,
  ModifyTitleAction,
  OpenChatAction,
  RefreshOpenChatAction,
  SendMessageAction,
  StoreChatKeyPairAction,
  StoreChatParticipants,
  StoreChatUsersAction,
  StoreDecryptedChatAction,
  StoreErrorMessageAction, StoreUnreadChatsCountAction,
  StoreUserChatsAction
} from "./chatTypes";
import { Chat, ChatMessageDecrypted, ChromunityUser } from "../../../types";

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

export const loadUserChats: ActionCreator<LoadUserChatsAction> = (user: ChromunityUser, force?: boolean) => ({
  type: ChatActionTypes.LOAD_USER_CHATS,
  user: user,
  force: force
});

export const storeUserChats: ActionCreator<StoreUserChatsAction> = (chats: Chat[]) => ({
  type: ChatActionTypes.STORE_USER_CHATS,
  chats: chats
});

export const openChat: ActionCreator<OpenChatAction> = (chat: Chat, user: ChromunityUser) => ({
  type: ChatActionTypes.OPEN_CHAT,
  chat: chat,
  user: user
});

export const refreshOpenChat: ActionCreator<RefreshOpenChatAction> = (user: ChromunityUser) => ({
  type: ChatActionTypes.REFRESH_OPEN_CHAT,
  user: user
});

export const storeDecryptedChat: ActionCreator<StoreDecryptedChatAction> = (
  chat: Chat,
  messages: ChatMessageDecrypted[],
  couldExistOlderMessages
) => ({
  type: ChatActionTypes.STORE_DECRYPTED_CHAT,
  chat: chat,
  messages: messages,
  couldExistOlderMessages: couldExistOlderMessages
});

export const storeChatParticipants: ActionCreator<StoreChatParticipants> = (chatParticipants: string[]) => ({
  type: ChatActionTypes.STORE_CHAT_PARTICIPANTS,
  chatParticipants: chatParticipants
});

export const sendMessage: ActionCreator<SendMessageAction> = (user: ChromunityUser, chat: Chat, message: string) => ({
  type: ChatActionTypes.SEND_MESSAGE,
  user: user,
  chat: chat,
  message: message
});

export const modifyTitleAction: ActionCreator<ModifyTitleAction> = (
  user: ChromunityUser,
  chat: Chat,
  title: string
) => ({
  type: ChatActionTypes.MODIFY_TITLE,
  user: user,
  chat: chat,
  title: title
});

export const loadChatUsersAction: ActionCreator<LoadChatUsersAction> = (user: ChromunityUser) => ({
  type: ChatActionTypes.LOAD_CHAT_USERS,
  user: user
});

export const storeChatUsersAction: ActionCreator<StoreChatUsersAction> = (
  followedChatUsers: string[],
  chatUsers: string[]
) => ({
  type: ChatActionTypes.STORE_CHAT_USERS,
  followedChatUsers: followedChatUsers,
  chatUsers: chatUsers
});

export const loadOlderMessagesAction: ActionCreator<LoadOlderMessagesAction> = () => ({
  type: ChatActionTypes.LOAD_OLDER_MESSAGES
});

export const deleteChatUserAction: ActionCreator<DeleteChatUserAction> = (user: ChromunityUser) => ({
  type: ChatActionTypes.DELETE_CHAT_USER,
  user: user
});

export const storeErrorMessage: ActionCreator<StoreErrorMessageAction> = (msg: string) => ({
  type: ChatActionTypes.STORE_ERROR_MESSAGE,
  message: msg
});

export const countUnreadChatsAction: ActionCreator<CountUnreadChatsAction> = (user: ChromunityUser) => ({
  type: ChatActionTypes.COUNT_UNREAD_CHATS,
  user: user
});

export const storeUnreadChatsCountAction: ActionCreator<StoreUnreadChatsCountAction> = (count: number) => ({
  type: ChatActionTypes.STORE_UNREAD_CHATS_COUNT,
  count: count
});

export const markChatAsReadAction: ActionCreator<MarkChatAsReadAction> = (user: ChromunityUser, chat: Chat) => ({
  type: ChatActionTypes.MARK_CHAT_AS_READ,
  user: user,
  chat: chat
});