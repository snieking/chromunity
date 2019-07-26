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
    last_modified: number;
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

export interface RepresentativeAction {
    id: string,
    representative: string,
    timestamp: number,
    action: string
}
