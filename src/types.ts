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
}

export interface TopicReply {
    id: string;
    author: string;
    message: string;
    timestamp: number;
}

export interface UserNotification {
    topicId: string;
    author: string;
    title: string;
    message: string;
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
