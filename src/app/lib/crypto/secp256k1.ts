import { getPublicKey, ProjectivePoint as Point, verify } from "@noble/secp256k1";

import { CrossBuffer, toArrayBuffer, toArrayBufferList } from "./buffer-to-uint8array.js";

class Secp256k1 {
	/**
	 * Create a public key from a private key.
	 *
	 * @param privateKey - The private key in a cross-buffer format.
	 * @param compressed - Determines if the public key should be in compressed format.
	 * @returns A Buffer containing the public key.
	 */
	public publicKeyCreate(privateKey: CrossBuffer, compressed: boolean): Buffer {
		const uint8PrivateKey = toArrayBuffer(privateKey);
		const pubKey = getPublicKey(uint8PrivateKey, compressed);
		return Buffer.from(pubKey);
	}

	/**
	 * Verify if a given public key is valid.
	 *
	 * @param publicKey - The public key in a cross-buffer format.
	 * @returns True if valid; false otherwise.
	 */
	public publicKeyVerify(publicKey: CrossBuffer): boolean {
		try {
			Point.fromHex(toArrayBuffer(publicKey));
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Combine multiple public keys (by adding their corresponding EC points).
	 *
	 * @param publicKeys - An array of public keys in cross-buffer format.
	 * @returns A Buffer containing the combined public key (compressed).
	 */
	public publicKeyCombine(publicKeys: CrossBuffer[]): Buffer {
		const points = toArrayBufferList(publicKeys).map((key) => Point.fromHex(key));

		let combinedPoint = points[0];
		for (let index = 1; index < points.length; index++) {
			combinedPoint = combinedPoint.add(points[index]);
		}

		return Buffer.from(combinedPoint.toRawBytes(true));
	}

	/**
	 * Verify a signature for a given hash and public key.
	 *
	 * @param hash - The message hash in a cross-buffer format.
	 * @param signature - The signature in a cross-buffer format.
	 * @param publicKey - The public key in a cross-buffer format.
	 * @returns A Promise that resolves to a boolean indicating signature validity.
	 */
	public async verify(hash: CrossBuffer, signature: CrossBuffer, publicKey: CrossBuffer): Promise<boolean> {
		const uint8Hash = toArrayBuffer(hash);
		const uint8Signature = toArrayBuffer(signature);
		const uint8PublicKey = toArrayBuffer(publicKey);
		return await verify(uint8Signature, uint8Hash, uint8PublicKey);
	}
}

export const secp256k1 = new Secp256k1();
