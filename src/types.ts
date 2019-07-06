export interface User {
    name: string,
    encryptedKey: string
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
