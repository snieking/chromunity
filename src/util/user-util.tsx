import {User} from "../types";

export function getUser(): User {
    const json = localStorage.getItem("user");
    return JSON.parse(json || '{}') as User;
}
