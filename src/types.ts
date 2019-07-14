export interface User {
    name: string,
    seed: string
}

export interface Thread {
    id: string,
    rootThreadId: string,
    author: string,
    message: string,
    timestamp: number
}

export interface UserNotification {
    threadId: string,
    rootThreadId: string,
    author: string,
    message: string,
    read: boolean,
    timestamp: number
}

export interface Election {
    id: string,
    timestamp: number
}

export interface UserSettings {
    avatar: string,
    description: string
}
