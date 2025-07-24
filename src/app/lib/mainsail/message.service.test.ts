import { describe, it, expect } from "vitest";
import { Services } from "@/app/lib/mainsail";
import { MessageService } from "./message.service";

describe("MessageService", () => {
	it("should sign a message", async () => {
		const service = new MessageService();
		const signatory = { signingKey: () => "test passphrase" };
		const input = { message: "hello", signatory };
		const result = await service.sign(input);
		expect(result).toHaveProperty("message");
		expect(result).toHaveProperty("signatory");
		expect(result).toHaveProperty("signature");
	});

	it("should verify a signed message", async () => {
		const service = new MessageService();
		const signatory = { signingKey: () => "test passphrase" };
		const input = { message: "hello", signatory };
		const signed = await service.sign(input);

		const verifyInput = {
			message: signed.message,
			signatory: signed.signatory,
			signature: signed.signature,
		};
		expect(service.verify(verifyInput)).toBe(true);
	});
});
