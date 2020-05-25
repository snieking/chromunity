import { ChatActions, ChatActionTypes, ChatState } from "./chatTypes";
import { Reducer } from "redux";

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

export const chatReducer: Reducer<ChatState, ChatActions> = (state = initialChatState, action) => {
  switch (action.type) {
    case ChatActionTypes.STORE_CHAT_KEY_PAIR: {
      return {
        ...state,
        rsaKey: action.rsaKey,
        successfullyAuthorized: true
      };
    }
    case ChatActionTypes.STORE_USER_CHATS: {
      return {
        ...state,
        chats: action.chats,
        lastUpdate: Date.now(),
        loading: false
      };
    }
    case ChatActionTypes.STORE_DECRYPTED_CHAT: {
      return {
        ...state,
        activeChat: action.chat,
        activeChatMessages: action.messages,
        activeChatCouldExistOlderMessages: action.couldExistOlderMessages
      };
    }
    case ChatActionTypes.STORE_CHAT_PARTICIPANTS: {
      return {
        ...state,
        activeChatParticipants: action.chatParticipants
      }
    }
    case ChatActionTypes.LEAVE_CHAT: {
      return {
        ...state
      }
    }
    case ChatActionTypes.CREATE_NEW_CHAT: {
      return {
        ...state
      }
    }
    case ChatActionTypes.STORE_CHAT_USERS: {
      return {
        ...state,
        followedChatUsers: action.followedChatUsers,
        chatUsers: action.chatUsers,
        chatUsersLastUpdate: Date.now()
      }
    }
    case ChatActionTypes.STORE_UNREAD_CHATS_COUNT: {
      return {
        ...state,
        unreadChats: action.count
      }
    }
  }

  return state;
};
