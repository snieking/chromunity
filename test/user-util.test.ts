import { setMnemonic, getMnemonic, setUser, getUser, isGod, setRepresentative, isRepresentative } from "../src/util/user-util";
import { User } from "../src/types";

describe("user utilities tests", () => {

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

});