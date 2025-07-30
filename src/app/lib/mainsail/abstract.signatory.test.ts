import { describe, it, expect } from "vitest";
import { AbstractSignatory } from "./abstract.signatory";

describe("AbstractDoubleSignatory", () => {
	const addressMock = "address";
	const publicKeyMock = "publicKey";

	it("should initialize", () => {
		const signingKeyMock = "signingKey123";

		const instance = new (class extends AbstractSignatory {})({
			address: addressMock,
			publicKey: publicKeyMock,
			signingKey: signingKeyMock,
		});

		expect(instance.signingKey()).toBe(signingKeyMock.normalize("NFD"));
		expect(instance.address()).toBe(addressMock);
		expect(instance.publicKey()).toBe(publicKeyMock);
	});

	it("should normalize signingKey to NFD", () => {
		const accentedSigningKey = "ãtest";

		const instance = new (class extends AbstractSignatory {})({
			address: addressMock,
			publicKey: publicKeyMock,
			signingKey: accentedSigningKey,
		});

		expect(instance.signingKey()).toBe(accentedSigningKey.normalize("NFD"));
	});

	it("should return options when provided", () => {
		const optionsMock = { bip39: true, senderPublicKey: "test" };

		const instance = new (class extends AbstractSignatory {})({
			address: addressMock,
			options: optionsMock,
			publicKey: publicKeyMock,
			signingKey: "signingKey",
		});

		expect(instance.options()).toBe(optionsMock);
	});

	it("should return undefined when options not provided", () => {
		const instance = new (class extends AbstractSignatory {})({
			address: addressMock,
			publicKey: publicKeyMock,
			signingKey: "signingKey",
		});

		expect(instance.options()).toBeUndefined();
	});
});
