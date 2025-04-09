import { base58 } from "@scure/base";
import { toArrayBuffer } from "./buffer-to-uint8array";

export class Base58 {
	public static encode(value: string | Buffer): string {
		return base58.encode(toArrayBuffer(value));
	}

	public static decode(value: string): Uint8Array {
		return base58.decode(value);
	}

	public static validate(value: string): boolean {
		try {
			base58.decode(value);
			return true;
		} catch {
			return false;
		}
	}
}
