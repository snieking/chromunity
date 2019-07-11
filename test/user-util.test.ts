import { setMnemonic, getMnemonic, setUser, getUser, isGod, setRepresentative, isRepresentative } from "../src/util/user-util";
import { User } from "../src/types";

describe("user utilities tests", () => {

    const admin: User = { name: "admin", seed: "abc123" };
    const user: User = { name: "snieking", seed: "abc123" };

    it("mnemonic cached in localstorage encrypted", async done => {
        const mnemonic: string = "car boat airplane";
        setMnemonic(mnemonic);
        expect(localStorage.getItem("local-bucket:mnemonic")).toBeDefined();
        expect(localStorage.getItem("local-bucket:mnemonic")).not.toBe(mnemonic);
        expect(getMnemonic()).toBe(mnemonic);
        done();
    });

    it("user cached in sessionStorage encrypted", async done => {
        setUser(user);
        expect(sessionStorage.getItem("session-bucket:user")).toBeDefined();
        expect(sessionStorage.getItem("session-bucket:user")).not.toMatch(/snieking/);
        expect(getUser().name).toBe(user.name);
        expect(getUser().seed).toBe(user.seed);
        done();
    });

    it("representative status cached in sessionStorage encrypted", async done => {
        isRepresentative().then(bool => {
            expect(bool).toBe(false);
            expect(sessionStorage.getItem("session-bucket:representative")).not.toBe(false);
            done();
        });
    });

});