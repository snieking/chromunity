import { User } from "ft3-lib";

export interface ChromunityUser {
  name: string;
  ft3User: User;
}

export interface EncryptedAccount {
  name: string;
  encryptedSeed: string;
}

export interface UserMeta {
  name: string;
  times_suspended: number;
  suspended_until: number;
}

export interface Topic {
  id: string;
  author: string;
  title: string;
  message: string;
  timestamp: number;
  last_modified: number;
  removed: boolean;
}

export interface TopicReply {
  id: string;
  topic_id: string;
  author: string;
  message: string;
  isSubReply: boolean;
  timestamp: number;
  removed: boolean;
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
  user: string;
  timestamp: number;
  handled: boolean;
  text: string;
}
