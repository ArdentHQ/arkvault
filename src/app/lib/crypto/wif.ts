import { Base58Check } from "./base58-check";

export interface Structure {
	readonly version: number;
	readonly privateKey: string;
	readonly compressed: boolean;
}

export class WIF {
	public static encode({ version, privateKey, compressed }: Structure): string {
		const privateKeyBytes: Buffer = Buffer.from(privateKey, "hex");

		if (privateKeyBytes.length !== 32) {
			throw new TypeError("Invalid privateKey length");
		}

		const result = Buffer.alloc(compressed ? 34 : 33);
		result.writeUInt8(version, 0);
		privateKeyBytes.copy(result, 1);

		if (compressed) {
			result[33] = 0x01;
		}

		return Base58Check.encode(result);
	}

	public static decode(string: string): Structure {
		const buffer: Buffer = Base58Check.decode(string);

		if (buffer.length === 33) {
			return {
				compressed: false,
				privateKey: buffer.slice(1, 33).toString("hex"),
				version: buffer[0],
			};
		}

		if (buffer.length !== 34) {
			throw new Error("Invalid WIF length");
		}

		if (buffer[33] !== 0x01) {
			throw new Error("Invalid compression flag");
		}

		return {
			compressed: true,
			privateKey: buffer.slice(1, 33).toString("hex"),
			version: buffer[0],
		};
	}
}
