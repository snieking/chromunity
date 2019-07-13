import { setMnemonic, getMnemonic, setUser, getUser, isGod, setRepresentative, isRepresentative, godAlias, ifEmptyAvatarThenPlaceholder } from "../src/util/user-util";
import { User } from "../src/types";

describe("user utilities tests", () => {

    const admin: User = { name: "admin", seed: "abc123" };
    const user: User = { name: "snieking", seed: "abc123" };

    it("mnemonic cached in localstorage encrypted", async () => {
        const mnemonic: string = "car boat airplane";
        setMnemonic(mnemonic);
        expect(localStorage.getItem("local-bucket:mnemonic")).toBeDefined();
        expect(localStorage.getItem("local-bucket:mnemonic")).not.toBe(mnemonic);
        expect(getMnemonic()).toBe(mnemonic);
    });

    it("user cached in sessionStorage encrypted", async () => {
        setUser(user);
        expect(sessionStorage.getItem("session-bucket:user")).toBeDefined();
        expect(sessionStorage.getItem("session-bucket:user")).not.toMatch(/snieking/);
        expect(getUser().name).toBe(user.name);
        expect(getUser().seed).toBe(user.seed);
    });

    it("representative status cached in sessionStorage encrypted", async () => {
        const representative: boolean = await isRepresentative();
        expect(representative).toBe(false);
        expect(sessionStorage.getItem("session-bucket:representative")).not.toBe(false);
    });

    it("god alias is admin", async () => {
        setUser(user);
        expect(isGod()).toBe(false);

        expect(godAlias()).toBe("admin");
        setUser(admin)
        expect(isGod()).toBe(true);
    });

    it("set representative", async () => {
        setRepresentative(true);
        const representative: boolean = await isRepresentative();
        expect(representative).toBe(true);
    });

    it("avatar placeholder", async () => {
        const placeholder: string = ifEmptyAvatarThenPlaceholder("");
        expect(placeholder).not.toBe("");

        const placeholder2: string = ifEmptyAvatarThenPlaceholder("");
        expect(placeholder2).not.toBe("");

        const noPlaceholder: string = ifEmptyAvatarThenPlaceholder("test");
        expect(noPlaceholder).toBe("test");
    })

});