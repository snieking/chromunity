import {generateRandomMnemonic} from "./CryptoService";

describe("crypto tests", () => {

    it("generate mnemonic", async () => {
        expect(generateRandomMnemonic().length).toBeGreaterThan(32);
    });

});