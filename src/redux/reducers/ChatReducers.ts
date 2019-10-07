import { ChatActions, ChatActionTypes, ChatState } from "../ChatTypes";
import { Reducer } from "redux";

const initialChatState: ChatState = {
  loading: false,
  rsaKey: null,
  successfullyAuthorized: false,
  chats: [],
  activeChat: null,
  activeChatMessages: [],
  lastUpdate: 0
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
        activeChatMessages: action.messages
      };
    }
    case ChatActionTypes.OPEN_CHAT: {
      return {
        ...state
      }
    }
    case ChatActionTypes.LEAVE_CHAT: {
      return {
        ...state,
        loading: true
      }
    }
    case ChatActionTypes.CREATE_NEW_CHAT: {
      return {
        ...state,
        loading: true
      }
    }
  }

  return state;
};
