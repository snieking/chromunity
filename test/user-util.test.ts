import {
  godAlias,
  ifEmptyAvatarThenPlaceholder,
  isGod,
  isRepresentative,
  setRepresentative,
  setUsername,
  storeKeyPair
} from "../src/util/user-util";
import { ChromunityUser } from "../src/types";
import { CREATE_LOGGED_IN_USER } from "./users";

describe("user utilities tests", () => {
  let user: ChromunityUser;

  it("login users", async () => {
    user = await CREATE_LOGGED_IN_USER();
  });

  it("representative status cached in sessionStorage encrypted", async () => {
    const representative: boolean = await isRepresentative();
    expect(representative).toBe(false);
    expect(sessionStorage.getItem("session-bucket:representative")).not.toBe(false);
  });

  it("god alias is admin", async () => {
    storeKeyPair(user.ft3User.keyPair);
    setUsername(user.name);
    expect(isGod()).toBe(false);

    expect(godAlias()).toBe("admin");
    setUsername("admin");
    expect(isGod()).toBe(true);
  });

  it("set representative", async () => {
    setRepresentative(true);
    const representative: boolean = await isRepresentative();
    expect(representative).toBe(true);
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
