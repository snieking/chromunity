import { ChromunityUser } from "../../../types";
import User from "ft3-lib/dist/ft3/user/user";

export enum AccountActionTypes {
  SET_AUTHENTICATION_STEP = "SET/AUTHENTICATION/STEP",
  LOGIN_ACCOUNT = "LOGIN/ACCOUNT",
  VAULT_SUCCESS = "VAULT/SUCCESS",
  VAULT_CANCEL = "VAULT/CANCEL",
  SAVE_VAULT_ACCOUNT = "STORE/VAULT/ACCOUNT",
  SET_USER = "VAULT/SET/USER",
  AUTO_LOGIN = "AUTO/LOGIN/ACCOUNT",
  LOGOUT_ACCOUNT = "LOGOUT/ACCOUNT",
  RESET_LOGIN_STATE = "ACCOUNT/LOGIN/RESET",
  REGISTER_USER = "ACCOUNT/REGISTER/USER",
  AUTO_LOGIN_ATTEMPTED = "ACCOUNT/AUTO/LOGIN/ATTEMPTED",
  CHECK_DISTRUSTED_USERS = "ACCOUNT/CHECK/DISTRUSTED_REPS",
  STORE_DISTRUSTED_USERS = "ACCOUNT/STORE/DISTRUSTED_REPS",
  STORE_USER_KUDOS = "ACCOUNT/STORE/KUDOS",
  CHECK_USER_KUDOS = "ACCOUNT/CHECK/KUDOS",
  SEND_KUDOS = "ACCOUNT/SEND/KUDOS"
}

export interface ISaveVaultAccount {
  accountId: string;
  ft3User: User;
}

export interface ISendKudos {
  receiver: string;
  kudos: number;
}

export enum AuthenticationStep {
  VAULT_IN_PROGRESS,
  CONFIRMING_VAULT_TRANSACTION,
  USERNAME_INPUT_REQUIRED,
  REGISTERING_USER,
  AUTHENTICATED
}

export interface AccountState {
  autoLoginInProgress: boolean;
  authenticationStep: AuthenticationStep;
  accountId: string;
  ft3User: User;
  user: ChromunityUser;
  distrustedUsers: string[];
  kudos: number;
}
