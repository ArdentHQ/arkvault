import { sha256 } from "@noble/hashes/sha256";

import { toArrayBuffer } from "./buffer-to-uint8array.js";

export class Hash {
	public static hash256(buffer: Buffer | string): Buffer {
		return Hash.sha256(Hash.sha256(buffer));
	}

	public static sha256(buffer: Buffer | string): Buffer {
		return Buffer.from(sha256(toArrayBuffer(buffer)));
	}
}
