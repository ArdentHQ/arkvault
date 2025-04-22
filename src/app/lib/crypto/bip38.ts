import { scryptSync } from "crypto";
import { createCipheriv, createDecipheriv } from "crypto";
import { Base58Check } from "./base58-check";
import BigInteger from "bigi";
import { secp256k1 } from "./ecurve/names";
import { Hash } from "./hash";

const SCRYPT_OPTS = { N: 16_384, dkLen: 64, p: 8, r: 8 };
const AES_ECB = "aes-256-ecb";
const HEADER = 0x01;
const TYPE = { ECMULT: 0x43, ENC: 0x42 };
const FLAG = { COMPRESSED: 0xe0, UNCOMPRESSED: 0xc0 };

// @TODO: Remove usage of Buffer.
export class BIP38 {
	static encrypt(privateKeyHex: string, passphrase: string, compressed = true): string {
		const keyBuf = Buffer.from(privateKeyHex, "hex");
		if (keyBuf.length !== 32) {
			throw new Error("Invalid private key length");
		}

		const address = this.getAddress(keyBuf, compressed);
		const salt = Hash.hash256(Buffer.from(address)).slice(0, 4);
		const { dkLen, N, r, p } = SCRYPT_OPTS;
		const derived = scryptSync(Buffer.from(passphrase, "utf8"), salt, dkLen, { N, p, r });
		const [half1, half2] = [derived.slice(0, 32), derived.slice(32)];

		const encrypted = createCipheriv(AES_ECB, half2, null).update(
			Buffer.from(keyBuf.map((b, index) => b ^ half1[index])),
		);

		const out = Buffer.concat([
			Buffer.from([HEADER, TYPE.ENC, compressed ? FLAG.COMPRESSED : FLAG.UNCOMPRESSED]),
			salt,
			encrypted,
		]);

		return Base58Check.encode(out);
	}

	static decrypt(bip38Str: string, passphrase: string): { privateKey: string; compressed: boolean } {
		const buf = Base58Check.decode(bip38Str);
		if (buf[0] !== HEADER) {
			throw new Error("Invalid BIP38 header");
		}
		const type = buf[1];
		const flag = buf[2];
		if (type === TYPE.ECMULT) {
			// EC multiply not covered in this simplified version
			throw new Error("EC multiply unsupported");
		}

		const compressed = flag === FLAG.COMPRESSED;
		const salt = buf.slice(3, 7);
		const encrypted = buf.slice(7);
		const { dkLen, N, r, p } = SCRYPT_OPTS;
		const derived = scryptSync(Buffer.from(passphrase, "utf8"), salt, dkLen, { N, p, r });
		const [half1, half2] = [derived.slice(0, 32), derived.slice(32)];

		const plain = createDecipheriv(AES_ECB, half2, null).update(encrypted);
		const keyBuf = Buffer.from(plain.map((b, index) => b ^ half1[index]));

		// verify
		const address = this.getAddress(keyBuf, compressed);
		if (!salt.equals(Hash.hash256(Buffer.from(address)).slice(0, 4))) {
			throw new Error("Passphrase mismatch");
		}

		return { compressed, privateKey: keyBuf.toString("hex") };
	}

	static verify(bip38Str: string): boolean {
		try {
			const buf = Base58Check.decode(bip38Str);
			if (buf[0] !== HEADER) {
				return false;
			}
			if (![TYPE.ENC, TYPE.ECMULT].includes(buf[1])) {
				return false;
			}
			if (buf.length !== 39) {
				return false;
			}
			return true;
		} catch {
			return false;
		}
	}

	private static getAddress(keyBuf: Buffer, compressed: boolean): string {
		const d = BigInteger.fromBuffer(keyBuf);
		const pub = secp256k1.G.multiply(d).getEncoded(compressed);
		const payload = Buffer.concat([Buffer.from([0x00]), Hash.hash160(pub)]);
		return Base58Check.encode(payload);
	}
}
