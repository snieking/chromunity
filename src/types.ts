import { User } from "ft3-lib";

export interface ChromunityUser {
  name: string;
  ft3User: User;
}

export interface Topic {
  id: string;
  author: string;
  title: string;
  message: string;
  timestamp: number;
  last_modified: number;
  latest_poster: string;
  moderated_by: string[];
}

export interface TopicReply {
  id: string;
  topic_id: string;
  author: string;
  message: string;
  isSubReply: boolean;
  timestamp: number;
  moderated_by: string[];
}

export interface UserNotification {
  id: string;
  trigger: string;
  content: string;
  read: boolean;
  timestamp: number;
}

export interface Election {
  id: string;
  timestamp: number;
}

export interface UserSettings {
  avatar: string;
  description: string;
}

export interface RepresentativeAction {
  id: string;
  representative: string;
  timestamp: number;
  action: string;
}

export interface RepresentativeReport {
  id: string;
  timestamp: number;
  text: string;
}

export interface ChatUserKeys {
  pubkey: string;
  encrypted_rsa: string;
}

export interface Chat {
  id: string;
  title: string;
  last_message: ChatMessage;
  encrypted_chat_key: string;
  timestamp: number;
  last_opened: number;
}

export interface ChatMessage {
  sender: string;
  timestamp: number;
  encrypted_msg: string;
}

export interface ChatMessageDecrypted {
  sender: string;
  timestamp: number;
  msg: string;
  inMemory: boolean;
}

export interface PollSpecification {
  question: string;
  options: Array<string>;
}

export interface PollData {
  question: string;
  options: Array<PollOption>;
}

export interface PollOption {
  option: string;
  votes: number;
}