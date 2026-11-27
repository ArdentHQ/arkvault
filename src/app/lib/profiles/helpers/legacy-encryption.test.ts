import { PBKDF2 } from "@ardenthq/arkvault-crypto";
import { describe, expect, it } from "vitest";

import { isLegacyEncryption } from "./legacy-encryption";

describe("isLegacyEncryption", () => {
	it("should detect CryptoJS AES output as legacy", () => {
		expect(
			isLegacyEncryption(
				"U2FsdGVkX19grIMNTCW8AxTGRfWnyM4hBr3WeT7gmBAbJhT0MjSiKw+nYSkuZpbt6KJNDCbQTWP1/h1xWGoX2w==",
			),
		).toBe(true);
	});

	it("should not detect PBKDF2 output as legacy", async () => {
		expect(isLegacyEncryption(await PBKDF2.encrypt("value", "password"))).toBe(false);
	});
});
