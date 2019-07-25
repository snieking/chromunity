export interface User {
    name: string;
    seed: string;
}

export interface Topic {
    id: string;
    author: string;
    title: string;
    message: string;
    timestamp: number;
    lastModified: number;
    removed: boolean;
}

export interface TopicReply {
    id: string;
    author: string;
    message: string;
    isSubReply: boolean;
    timestamp: number;
    removed: boolean;
}

export interface UserNotification {
    id: string;
    trigger: string;
    content: any;
    read: boolean;
    timestamp: number;
}

export interface Election {
    id: string,
    timestamp: number
}

export interface UserSettings {
    avatar: string,
    description: string
}
