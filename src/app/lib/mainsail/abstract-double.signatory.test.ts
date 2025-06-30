import { describe, it, expect } from "vitest";
import { AbstractDoubleSignatory } from "./abstract-double.signatory";

describe("AbstractDoubleSignatory", () => {
	const addressMock = "address";
	const publicKeyMock = "publicKey";

	it("should initialize", () => {
		const signingKeyMock = "signingKey123";
		const confirmKeyMock = "confirmKey123";

		const instance = new (class extends AbstractDoubleSignatory { })({
			address: addressMock,
			confirmKey: confirmKeyMock,
			publicKey: publicKeyMock,
			signingKey: signingKeyMock,
		});

		expect(instance.signingKey()).toBe(signingKeyMock.normalize("NFD"));
		expect(instance.confirmKey()).toBe(confirmKeyMock.normalize("NFD"));
		expect(instance.address()).toBe(addressMock);
		expect(instance.publicKey()).toBe(publicKeyMock);
	});

	it("should normalize signingKey and confirmKey to NFD", () => {
		const accentedSigningKey = "ãtest";
		const accentedConfirmKey = "tést";

		const instance = new (class extends AbstractDoubleSignatory { })({
			address: addressMock,
			confirmKey: accentedConfirmKey,
			publicKey: publicKeyMock,
			signingKey: accentedSigningKey,
		});

		expect(instance.signingKey()).toBe(accentedSigningKey.normalize("NFD"));
		expect(instance.confirmKey()).toBe(accentedConfirmKey.normalize("NFD"));
	});
});
