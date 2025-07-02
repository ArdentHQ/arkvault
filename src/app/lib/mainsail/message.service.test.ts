import { describe, it, expect } from "vitest";
import { Services } from "@/app/lib/mainsail";
import { MessageService } from "./message.service";

describe("MessageService", () => {
	it("should sign a message", async () => {
		const service = new MessageService();
		const input: Services.MessageInput = {
			message: "test",
			signatory: {
				signingKey: () => "123",
			},
		};
		const signed = await service.sign(input);
		console.log({ signed });

		expect(signed.message).toBe("test");
		expect(signed.signatory).toBeDefined();
		expect(signed.signature).toBeDefined();
	});
});
