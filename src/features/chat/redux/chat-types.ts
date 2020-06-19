import { Chat, ChatMessageDecrypted, ChromunityUser } from "../../../types";

export enum ChatActionTypes {
  CHECK_CHAT_AUTH_ACTION = "CHAT/AUTH/CHECK",
  CREATE_CHAT_KEY_PAIR = "CHAT/KEYPAIR/CREATE",
  STORE_CHAT_KEY_PAIR = "CHAT/KEYPAIR/STORE",
  STORE_CHAT_PARTICIPANTS = "CHAT/PARTICIPANTS/STORE",
  CREATE_NEW_CHAT = "CHAT/CREATE/NEW",
  ADD_USER_TO_CHAT = "CHAT/USER/INVITE",
  LEAVE_CHAT = "CHAT/USER/LEAVE",
  LOAD_USER_CHATS = "CHATS/USER/LOAD",
  STORE_USER_CHATS = "CHATS/USER/STORE",
  OPEN_CHAT = "CHAT/OPEN",
  REFRESH_OPEN_CHAT = "CHAT/REFRESH",
  STORE_DECRYPTED_CHAT = "CHAT/DECRYPTED/STORE",
  SEND_MESSAGE = "CHAT/MESSAGE/SEND",
  MODIFY_TITLE = "CHAT/TITLE/MODIFY",
  LOAD_CHAT_USERS = "LOAD/CHAT/USERS",
  STORE_CHAT_USERS = "STORE/CHAT/USERS",
  LOAD_OLDER_MESSAGES = "LOAD/OLDER/MESSAGES",
  DELETE_CHAT_USER = "CHAT/USER/DELETE",
  STORE_ERROR_MESSAGE = "STORE/ERROR/MESSAGE",
  COUNT_UNREAD_CHATS = "COUNT/CHATS/UNREAD",
  STORE_UNREAD_CHATS_COUNT = "STORE/CHATS/UNREAD/COUNT",
  MARK_CHAT_AS_READ = "MARK/CHAT/AS/READ"
}

export interface ICreateChatKeyPair {
  user: ChromunityUser;
  password: string;
}

export interface IAddUserToChat {
  username: string;
  user: ChromunityUser;
}

export interface ILoadUserChats {
  force?: boolean;
  user: ChromunityUser;
}

export interface IOpenChat {
  chat: Chat;
  user: ChromunityUser;
}

export interface IStoreDecryptedChat {
  chat: Chat;
  messages: ChatMessageDecrypted[];
  couldExistOlderMessages: boolean;
}

export interface ISendMessage {
  user: ChromunityUser;
  chat: Chat;
  message: string;
}

export interface IModifyTitle {
  user: ChromunityUser;
  chat: Chat;
  title: string;
}

export interface IStoreChatUsers {
  followedChatUsers: string[];
  chatUsers: string[];
}

export interface IMarkChatAsRead {
  user: ChromunityUser;
  chat: Chat;
}

export interface ChatState {
  rsaKey: any;
  successfullyAuthorized: boolean;
  chats: Chat[];
  activeChat: Chat;
  activeChatMessages: ChatMessageDecrypted[];
  activeChatParticipants: string[];
  activeChatCouldExistOlderMessages: boolean;
  lastUpdate: number;
  followedChatUsers: string[];
  chatUsers: string[];
  chatUsersLastUpdate: number;
  unreadChats: number;
}
