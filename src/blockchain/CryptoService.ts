import * as bip39 from "bip39";
import * as hdkey from "hdkey";
import * as cryptoJS from 'crypto-js';
import * as crypto from 'crypto'
import * as secp256k1 from 'secp256k1'

export function generateRandomMnemonic(): string {
    return bip39.generateMnemonic();
}

export function seedFromMnemonic(mnemonic: string, password: string) {
    return bip39.mnemonicToSeedSync(mnemonic, password).toString("hex");
}

export function seedToKey(seed: string): { privKey: Buffer, pubKey: Buffer } {
    const node = hdkey.fromMasterSeed(toBuffer(seed));
    return {privKey: node.privateKey, pubKey: node.publicKey};
}

function toBuffer(keyAsHex: string): Buffer {
    return Buffer.from(keyAsHex, "hex");
}

export function encrypt(data: string, key: string): string {
    return cryptoJS.AES.encrypt(data, key).toString();
}

export function decrypt(data: string, key: string): string {
    return cryptoJS.AES.decrypt(data, key).toString(cryptoJS.enc.Utf8);
}

export function makeKeyPair() {
    let privKey
    do {
        privKey = crypto.randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))
    const pubKey = secp256k1.publicKeyCreate(privKey)
    return { pubKey, privKey }
}