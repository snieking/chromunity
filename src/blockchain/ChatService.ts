import { BLOCKCHAIN, GTX } from "./Postchain";
import { Chat, ChatMessage, ChromunityUser } from "../types";
import { gaRellOperationTiming } from "../GoogleAnalytics";
import { createStopwatchStarted, handleGADuringException, stopStopwatch, uniqueId } from "../util/util";

export function getUserPubKey(username: string): Promise<string> {
  return GTX.query("get_chat_user_pubkey", { username: username });
}

export function createChatUser(user: ChromunityUser, pubKey: Buffer) {
  const operation = "create_chat_user";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(user.ft3User, operation, user.ft3User.authDescriptor.hash().toString("hex"), user.name, pubKey);
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function createNewChat(user: ChromunityUser, chatId: string, encryptedChatKey: string) {
  const operation = "create_chat";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      operation,
      chatId,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name,
      "Untitled",
      encryptedChatKey
    );
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function sendChatMessage(user: ChromunityUser, chatId: string, message: string) {
  const operation = "send_chat_message";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc =>
    bc
      .transactionBuilder()
      .addOperation(operation, chatId, user.ft3User.authDescriptor.hash().toString("hex"), user.name, message)
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
  )
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function addUserToChat(user: ChromunityUser, chatId: string, targetUser: string, encryptedChatKey: string) {
  const operation = "add_user_to_chat";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      operation,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name,
      chatId,
      targetUser,
      encryptedChatKey
    );
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function leaveChat(user: ChromunityUser, chatId: string) {
  const operation = "leave_chat";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      operation,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name,
      chatId
    );
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function modifyTitle(user: ChromunityUser, chatId: string, updatedTitle: string) {
  const operation = "modify_chat_title";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      operation,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name,
      chatId,
      updatedTitle
    );
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function getUserChats(username: string): Promise<Chat[]> {
  return GTX.query("get_user_chats", { username: username });
}

export function getChatMessages(id: string): Promise<ChatMessage[]> {
  return GTX.query("get_chat_messages", { id: id });
}

export function getChatParticipants(id: string): Promise<string[]> {
  return GTX.query("get_chat_participants", { id: id });
}

export function getFollowedChatUsers(username: string): Promise<string[]> {
  return GTX.query("get_followed_chat_users", { username: username });
}

export function getChatUsers(): Promise<string[]> {
  return GTX.query("get_chat_users", {});
}