import * as bip39 from 'bip39';
import * as hdkey from 'hdkey';
import * as cryptoJS from 'crypto-js';
import * as crypto from 'crypto';
import * as secp256k1 from 'secp256k1';
import * as cryptico from 'cryptico';

export function generateRandomMnemonic(): string {
  return bip39.generateMnemonic();
}

export function seedFromMnemonic(mnemonic: string, password: string) {
  return bip39.mnemonicToSeedSync(mnemonic, password).toString('hex');
}

export function seedFromPassword(password: string): Promise<string> {
  return bip39.mnemonicToSeed(password).toString('hex');
}

function toBuffer(keyAsHex: string): Buffer {
  return Buffer.from(keyAsHex, 'hex');
}

export function seedToKey(seed: string): { privKey: Buffer; pubKey: Buffer } {
  const node = hdkey.fromMasterSeed(toBuffer(seed));
  return { privKey: node.privateKey, pubKey: node.publicKey };
}

export function encrypt(data: string, key: string): string {
  return cryptoJS.AES.encrypt(data, key).toString();
}

export function decrypt(data: string, key: string): string {
  return cryptoJS.AES.decrypt(data, key).toString(cryptoJS.enc.Utf8);
}

export function generateRSAKey(passphrase: string) {
  return cryptico.generateRSAKey(passphrase, 1024);
}

export function rsaKeyToPubKey(rsaKey: any) {
  return cryptico.publicKeyString(rsaKey);
}

export function rsaEncrypt(data: string, rsaPubKey: string): string {
  return cryptico.encrypt(data, rsaPubKey);
}

export function rsaDecrypt(data: string, rsaKey: any): any {
  return cryptico.decrypt(data, rsaKey);
}

export function makeKeyPair() {
  let privKey;
  do {
    privKey = Uint8Array.from(crypto.randomBytes(32));
  } while (!secp256k1.privateKeyVerify(privKey));
  const pubKey = secp256k1.publicKeyCreate(privKey);
  return { pubKey: Buffer.from(pubKey.buffer), privKey: Buffer.from(privKey.buffer) };
}
