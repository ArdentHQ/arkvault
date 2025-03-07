// Based on https://github.com/simplyhexagonal/string-crypto/blob/main/src/index.ts

import AES from "crypto-js/aes.js";
import Utf8 from "crypto-js/enc-utf8.js";

class Implementation {
	public async encrypt(value: string, password: string): Promise<string> {
		return await AES.encrypt(value, password).toString();
	}

	public async decrypt(hash: string, password: string): Promise<string> {
		return await AES.decrypt(hash, password).toString(Utf8);
	}
}

// @TODO: export as AES
export const PBKDF2 = new Implementation();
