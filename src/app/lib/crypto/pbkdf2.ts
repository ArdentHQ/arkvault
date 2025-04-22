import { base64 } from '@scure/base'
import { pbkdf2 } from '@noble/hashes/pbkdf2'
import { sha256 } from '@noble/hashes/sha256'
import { gcm } from '@noble/ciphers/aes'

const Encoder = new TextEncoder()
const Decoder = new TextDecoder()

export class Implementation {
	encrypt = (value: string, password: string): string => {
		const si = crypto.getRandomValues(new Uint8Array(28))
		const k = pbkdf2(sha256, Encoder.encode(password), si.subarray(0, 16), { c: 1e5, dkLen: 32 })
		const c = gcm(k, si.subarray(16)).encrypt(Encoder.encode(value))
		return base64.encode(Uint8Array.of(...si, ...c))
	}

	decrypt = (encrypted: string, password: string): string => {
		const r = base64.decode(encrypted)
		const k = pbkdf2(sha256, Encoder.encode(password), r.subarray(0, 16), { c: 1e5, dkLen: 32 })
		const pt = gcm(k, r.subarray(16, 28)).decrypt(r.subarray(28))
		return Decoder.decode(pt)
	}
}

export const PBKDF2 = new Implementation();
