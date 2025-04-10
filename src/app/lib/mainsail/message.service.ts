import { Message } from "@arkecosystem/typescript-crypto";
import { Services } from "@ardenthq/sdk";

export class MessageService {
	public async sign(input: Services.MessageInput): Promise<Services.SignedMessage> {
		const signedMessage = await Message.sign(input.message, input.signatory.privateKey());

		return {
			message: signedMessage.message,
			signatory: signedMessage.publicKey,
			signature: signedMessage.signature,
		};
	}

	public verify(input: Services.SignedMessage): boolean {
		const message = new Message({
			publicKey: input.signatory,
			signature: input.signature,
			message: input.message,
		});

		return message.verify();
	}
}
