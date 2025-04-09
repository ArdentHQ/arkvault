/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { Hash as ARK } from "./crypto/hash";
import { Hash } from "@/app/lib/crypto";
import { Services } from "@/app/lib/sdk";

export class MessageService extends Services.AbstractMessageService {
	public override async sign(input: Services.MessageInput): Promise<Services.SignedMessage> {
		return {
			message: input.message,
			signatory: input.signatory.publicKey(),
			signature: ARK.signSchnorr(Hash.sha256(input.message), {
				compressed: false,
				privateKey: input.signatory.privateKey(),
				publicKey: input.signatory.publicKey(),
			}),
		};
	}

	public override async verify(input: Services.SignedMessage): Promise<boolean> {
		return ARK.verifySchnorr(Hash.sha256(input.message), input.signature, input.signatory);
	}
}
