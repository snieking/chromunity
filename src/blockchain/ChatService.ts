import { executeOperations, executeQuery } from "./Postchain";
import { Chat, ChatMessage, ChromunityUser } from "../types";
import { toLowerCase } from "../util/util";
import * as BoomerangCache from "boomerang-cache";
import { nop, op } from "ft3-lib";

const UNREAD_CHATS_KEY = "unreadChats";

const chatCache = BoomerangCache.create("chat-bucket", {
  storage: "session",
  encrypt: false
});

export function getUserPubKey(username: string): Promise<string> {
  return executeQuery("get_chat_user_pubkey", { username: username });
}

export function createChatUser(user: ChromunityUser, pubKey: Buffer) {
  const operation = "create_chat_user";

  return executeOperations(
    user.ft3User,
    op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name), pubKey),
    nop()
  );
}

export function deleteChatUser(user: ChromunityUser) {
  const operation = "delete_chat_user";

  return executeOperations(user.ft3User, op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name)), nop());
}

export function createNewChat(user: ChromunityUser, chatId: string, encryptedChatKey: string) {
  const operation = "create_chat";

  return executeOperations(
    user.ft3User,
    op(operation, chatId, user.ft3User.authDescriptor.id, user.name, "Untitled", encryptedChatKey)
  );
}

export function sendChatMessage(user: ChromunityUser, chatId: string, message: string) {
  const operation = "send_chat_message";

  return executeOperations(
    user.ft3User,
    op(operation, chatId, user.ft3User.authDescriptor.id, user.name, message),
    nop()
  );
}

export function addUserToChat(user: ChromunityUser, chatId: string, targetUser: string, encryptedChatKey: string) {
  const operation = "add_user_to_chat";

  return executeOperations(
    user.ft3User,
    op(operation, user.ft3User.authDescriptor.id, user.name, chatId, targetUser, encryptedChatKey)
  );
}

export function leaveChat(user: ChromunityUser, chatId: string) {
  const operation = "leave_chat";

  return executeOperations(user.ft3User, op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name), chatId));
}
export function markChatAsRead(user: ChromunityUser, chatId: string) {
  chatCache.remove(UNREAD_CHATS_KEY);
  const operation = "update_last_opened_timestamp";

  return executeOperations(
    user.ft3User,
    op(operation, chatId, user.ft3User.authDescriptor.id, toLowerCase(user.name)),
    nop()
  );
}

export function modifyTitle(user: ChromunityUser, chatId: string, updatedTitle: string) {
  const operation = "modify_chat_title";

  return executeOperations(
    user.ft3User,
    op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name), chatId, updatedTitle)
  );
}

export function getUserChats(username: string): Promise<Chat[]> {
  return executeQuery("get_user_chats", { username: username });
}

export function getChatMessages(id: string, priorTo: number, pageSize: number): Promise<ChatMessage[]> {
  return executeQuery("get_chat_messages", { id: id, prior_to: priorTo, page_size: pageSize }).then(
    (messages: ChatMessage[]) => messages.reverse()
  );
}

export function getChatMessagesAfterTimestamp(
  id: string,
  afterTimestamp: number,
  pageSize: number
): Promise<ChatMessage[]> {
  return executeQuery("get_chat_messages_after", { id: id, after_timestamp: afterTimestamp, page_size: pageSize });
}

export function getChatParticipants(id: string): Promise<string[]> {
  return executeQuery("get_chat_participants", { id: id });
}

export function getFollowedChatUsers(username: string): Promise<string[]> {
  return executeQuery("get_followed_chat_users", { username: username });
}

export function getChatUsers(): Promise<string[]> {
  return executeQuery("get_chat_users", {});
}

export function countUnreadChats(username: string): Promise<number> {
  const count = chatCache.get(UNREAD_CHATS_KEY);

  return count != null
    ? new Promise<number>(resolve => resolve(count))
    : executeQuery("count_unread_chats", { username: username }).then((count: number) => {
        chatCache.set(UNREAD_CHATS_KEY, count, 15);
        return count;
      });
}
