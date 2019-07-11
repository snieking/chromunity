import { setMnemonic, getMnemonic, setUser, getUser, isGod, setRepresentative, isRepresentative } from "../src/util/user-util";
import { User } from "../src/types";

describe("user utilities tests", () => {

    const admin: User = { name: "admin", seed: "abc123" };
    const user: User = { name: "snieking", seed: "abc123" };

    it("mnemonic cached in localstorage encrypted", async done => {
        const mnemonic: string = "car boat airplane";
        setMnemonic(mnemonic);
        expect(localStorage.getItem("mnemonic")).toBeDefined();
        expect(localStorage.getItem("mnemonic")).not.toBe(mnemonic);
        expect(getMnemonic()).toBe(mnemonic);
        done();
    });

    it("user cached in sessionStorage encrypted", async done => {
        setUser(user);
        expect(sessionStorage.getItem("user")).toBeDefined();
        expect(sessionStorage.getItem("user")).not.toBe(user);
        expect(getUser()).toBe(user);
        done();
    });

    it("representative status cached in sessionStorage encrypted", async done => {
        isRepresentative().then(bool => {
            expect(bool).toBe(false);
            expect(sessionStorage.getItem("representative")).not.toBe(false);
            done();
        });
    });

});