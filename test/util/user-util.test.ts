import {
  godAlias,
  ifEmptyAvatarThenPlaceholder,
  isGod,
  setUsername,
  storeKeyPair
} from "../../src/util/user-util";
import { ChromunityUser } from "../../src/types";
import { CREATE_LOGGED_IN_USER } from "../users";

describe("user utilities tests", () => {
  let user: ChromunityUser;

  it("login users", async () => {
    user = await CREATE_LOGGED_IN_USER();
  });

  it("god alias is admin", async () => {
    storeKeyPair(user.ft3User.keyPair);
    setUsername(user.name);
    expect(isGod()).toBe(false);

    expect(godAlias()).toBe("admin");
    setUsername("admin");
    expect(isGod()).toBe(true);
  });

  it("avatar placeholder", async () => {
    const placeholder: string = ifEmptyAvatarThenPlaceholder("", "snieking");
    expect(placeholder).not.toBe("");

    const placeholder2: string = ifEmptyAvatarThenPlaceholder("", "snieking");
    expect(placeholder2).not.toBe("");

    const noPlaceholder: string = ifEmptyAvatarThenPlaceholder("test", "snieking");
    expect(noPlaceholder).toBe("test");
  });
});
