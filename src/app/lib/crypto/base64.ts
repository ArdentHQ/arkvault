import { base64 } from "@scure/base";
import { toArrayBuffer } from "./buffer-to-uint8array";

/**
 * Wrapper for Base64 encoding/decoding using @scure/base without Node Buffer.
 */
export class Base64 {
	public static encode(value: string | Buffer): string {
		// Convert input to ArrayBuffer then to Uint8Array
		const arrayBuffer = toArrayBuffer(value);
		const bytes = new Uint8Array(arrayBuffer);
		return base64.encode(bytes);
	}

	public static decode(value: string): string {
		return base64.decode(value).toString()
	}

	public static validate(value: string): boolean {
		try {
			base64.decode(value);
			return true;
		} catch {
			return false;
		}
	}
}
