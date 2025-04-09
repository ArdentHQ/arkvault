/* eslint-disable unicorn/no-object-as-default-parameter */

import createXpub from "create-xpub";
import hdkey from "hdkey";

export class HDKey {
	public static fromSeed(seed: string | Buffer): hdkey {
		return hdkey.fromMasterSeed(seed instanceof Buffer ? seed : Buffer.from(seed));
	}

	public static fromExtendedPublicKey(publicKey: string): hdkey {
		if (!publicKey.startsWith("xpub")) {
			throw new Error("The given key is not an extended public key.");
		}

		return hdkey.fromExtendedKey(publicKey);
	}

	public static fromExtendedPrivateKey(privateKey: string): hdkey {
		if (!privateKey.startsWith("xprv")) {
			throw new Error("The given key is not an extended private key.");
		}

		return hdkey.fromExtendedKey(privateKey);
	}

	public static fromCompressedPublicKey(
		publicKey: string,
		options: { depth: number; childNumber: number } = { childNumber: 2_147_483_648, depth: 0 },
	): hdkey {
		return HDKey.fromExtendedPublicKey(
			createXpub({
				// Account 0 = 0 + 0x80000000
				chainCode: publicKey.slice(-64),
				childNumber: options.childNumber,
				depth: options.depth,
				publicKey: publicKey.slice(0, 66),
			}),
		);
	}
}
