import * as cryptoJS from "crypto-js";
import * as secp256k1 from 'secp256k1';
import * as crypto from "crypto";

export function toBuffer(keyAsHex: string): Buffer {
    return Buffer.from(keyAsHex, "hex");
}

export function generatePrivateKey(): string {
    return crypto.randomBytes(32).toString("hex");
}

export function generatePublicKey(privateKeyHex: string): string {
    return secp256k1.publicKeyCreate(toBuffer(privateKeyHex)).toString("hex");
}

export function encrypt(privateKey: Buffer, data: string): string {
    return cryptoJS.AES.encrypt(data, privateKey.toString("hex")).toString();
}

export function decrypt(privateKey: Buffer, data: string): string {
    return cryptoJS.AES.decrypt(data, privateKey.toString("hex")).toString(cryptoJS.enc.Utf8);
}

export function hash(message: string) {
    return cryptoJS.SHA3(message).toString();
}
