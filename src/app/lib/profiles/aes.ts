import { cbc } from "@noble/ciphers/aes.js";
import { md5 } from "@noble/hashes/legacy.js";
import { concatBytes } from "@noble/hashes/utils.js";

function evpBytesToKey(password: string, salt: Uint8Array): { key: Uint8Array; iv: Uint8Array } {
	const passwordBytes = new TextEncoder().encode(password);
	let derived = new Uint8Array(0);
	let block = new Uint8Array(0);

	while (derived.length < 48) {
		block = md5(concatBytes(block, passwordBytes, salt));
		derived = concatBytes(derived, block);
	}

	return { iv: derived.slice(32, 48), key: derived.slice(0, 32) };
}

class AESImplementation {
	public decrypt(ciphertextBase64: string, password: string): string {
		const bytes = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
		const salt = bytes.slice(8, 16);
		const ciphertext = bytes.slice(16);
		const { key, iv } = evpBytesToKey(password, salt);
		return new TextDecoder().decode(cbc(key, iv).decrypt(ciphertext));
	}
}

export const AES = new AESImplementation();
