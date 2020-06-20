import * as BoomerangCache from 'boomerang-cache';
import { nop, op } from 'ft3-lib';
import { executeOperations, executeQuery } from './postchain';
import { Chat, ChatMessage, ChromunityUser } from '../../types';
import { toLowerCase } from '../../shared/util/util';

const UNREAD_CHATS_KEY = 'unreadChats';

const chatCache = BoomerangCache.create('chat-bucket', {
  storage: 'session',
  encrypt: false,
});

export function getUserPubKey(username: string): Promise<string> {
  return executeQuery('get_chat_user_pubkey', { username });
}

export function createChatUser(user: ChromunityUser, pubKey: Buffer): Promise<unknown> {
  const operation = 'create_chat_user';

  return executeOperations(
    user.ft3User,
    op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name), pubKey),
    nop()
  );
}

export function deleteChatUser(user: ChromunityUser): Promise<unknown> {
  const operation = 'delete_chat_user';

  return executeOperations(user.ft3User, op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name)), nop());
}

export function createNewChat(user: ChromunityUser, chatId: string, encryptedChatKey: string): Promise<unknown> {
  const operation = 'create_chat';

  return executeOperations(
    user.ft3User,
    op(operation, chatId, user.ft3User.authDescriptor.id, user.name, 'Untitled', encryptedChatKey)
  );
}

export function sendChatMessage(user: ChromunityUser, chatId: string, message: string): Promise<unknown> {
  const operation = 'send_chat_message';

  return executeOperations(
    user.ft3User,
    op(operation, chatId, user.ft3User.authDescriptor.id, user.name, message),
    nop()
  );
}

export function addUserToChat(
  user: ChromunityUser,
  chatId: string,
  targetUser: string,
  encryptedChatKey: string
): Promise<unknown> {
  const operation = 'add_user_to_chat';

  return executeOperations(
    user.ft3User,
    op(operation, user.ft3User.authDescriptor.id, user.name, chatId, targetUser, encryptedChatKey)
  );
}

export function leaveChat(user: ChromunityUser, chatId: string): Promise<unknown> {
  const operation = 'leave_chat';

  return executeOperations(user.ft3User, op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name), chatId));
}
export function markChatAsRead(user: ChromunityUser, chatId: string): Promise<unknown> {
  chatCache.remove(UNREAD_CHATS_KEY);
  const operation = 'update_last_opened_timestamp';

  return executeOperations(
    user.ft3User,
    op(operation, chatId, user.ft3User.authDescriptor.id, toLowerCase(user.name)),
    nop()
  );
}

export function modifyTitle(user: ChromunityUser, chatId: string, updatedTitle: string): Promise<unknown> {
  const operation = 'modify_chat_title';

  return executeOperations(
    user.ft3User,
    op(operation, user.ft3User.authDescriptor.id, toLowerCase(user.name), chatId, updatedTitle)
  );
}

export function getUserChats(username: string): Promise<Chat[]> {
  return executeQuery('get_user_chats', { username });
}

export function getChatMessages(id: string, priorTo: number, pageSize: number): Promise<ChatMessage[]> {
  return executeQuery('get_chat_messages', {
    id,
    prior_to: priorTo,
    page_size: pageSize,
  }).then((messages: ChatMessage[]) => messages.reverse());
}

export function getChatMessagesAfterTimestamp(
  id: string,
  afterTimestamp: number,
  pageSize: number
): Promise<ChatMessage[]> {
  return executeQuery('get_chat_messages_after', { id, after_timestamp: afterTimestamp, page_size: pageSize });
}

export function getChatParticipants(id: string): Promise<string[]> {
  return executeQuery('get_chat_participants', { id });
}

export function getFollowedChatUsers(username: string): Promise<string[]> {
  return executeQuery('get_followed_chat_users', { username });
}

export function getChatUsers(): Promise<string[]> {
  return executeQuery('get_chat_users', {});
}

export function countUnreadChats(username: string): Promise<number> {
  const count = chatCache.get(UNREAD_CHATS_KEY);

  return count != null
    ? new Promise<number>((resolve) => resolve(count))
    : executeQuery('count_unread_chats', { username }).then((c: number) => {
        chatCache.set(UNREAD_CHATS_KEY, c, 15);
        return c;
      });
}
