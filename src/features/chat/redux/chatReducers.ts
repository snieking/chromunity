import { ChatState } from "./chatTypes";
import { createReducer } from "@reduxjs/toolkit";
import { storeChatKeyPair, storeUserChats, storeDecryptedChat, storeChatParticipants, storeChatUsers, storeUnreadChatsCount } from "./chatActions";

const initialChatState: ChatState = {
  rsaKey: null,
  successfullyAuthorized: false,
  chats: [],
  activeChat: null,
  activeChatMessages: [],
  activeChatParticipants: [],
  activeChatCouldExistOlderMessages: false,
  lastUpdate: 0,
  followedChatUsers: [],
  chatUsers: [],
  chatUsersLastUpdate: 0,
  unreadChats: 0
};

export const chatReducer = createReducer(initialChatState, builder =>
  builder
    .addCase(storeChatKeyPair, (state, action) => {
      state.rsaKey = action.payload;
      state.successfullyAuthorized = true;
    })
    .addCase(storeUserChats, (state, action) => {
      state.chats = action.payload;
      state.lastUpdate = Date.now();
    })
    .addCase(storeDecryptedChat, (state, action) => {
      state.activeChat = action.payload.chat;
      state.activeChatMessages = action.payload.messages;
      state.activeChatCouldExistOlderMessages = action.payload.couldExistOlderMessages;
    })
    .addCase(storeChatParticipants, (state, action) => {
      state.activeChatParticipants = action.payload;
    })
    .addCase(storeChatUsers, (state, action) => {
      state.followedChatUsers = action.payload.followedChatUsers;
      state.chatUsers = action.payload.chatUsers;
      state.chatUsersLastUpdate = Date.now();
    })
    .addCase(storeUnreadChatsCount, (state, action) => {
      state.unreadChats = action.payload;
    })
)
