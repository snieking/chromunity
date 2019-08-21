import { ChromunityUser } from "../types";
import { BLOCKCHAIN } from "./Postchain";
import { clearRepresentativesCache } from "./RepresentativesService";

export function adminAddRepresentative(user: ChromunityUser, username: string) {
  return toggleRepresentative(user, username.toLocaleLowerCase(), "tmp_add_representative");
}

export function adminRemoveRepresentative(user: ChromunityUser, username: string) {
  return toggleRepresentative(user, username.toLocaleLowerCase(), "tmp_remove_representative");
}

function toggleRepresentative(user: ChromunityUser, username: string, rellOperation: string) {
  clearRepresentativesCache();
  return BLOCKCHAIN.then(bc => bc.call(user.ft3User, rellOperation, user.name, username.toLocaleLowerCase()));
}
