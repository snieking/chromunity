import { ifEmptyAvatarThenPlaceholder } from "./user-util";
import { ChromunityUser } from "../../types";
import { CREATE_LOGGED_IN_USER } from "../test-utility/users";

describe("user utilities tests", () => {

  it("login users", async () => {
    const user = await CREATE_LOGGED_IN_USER();
    expect(user).toBeDefined();
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
