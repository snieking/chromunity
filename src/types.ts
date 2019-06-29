export interface User {
    name: string,
    encryptedKey: string
}

export interface Thread {
    id: string,
    author: string,
    message: string,
    timestamp: number
    starRatedBy: string[]
}
