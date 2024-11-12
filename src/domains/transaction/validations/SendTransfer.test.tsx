/* eslint-disable @typescript-eslint/require-await */
import { BigNumber } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";

import { sendTransfer } from "./SendTransfer";
import { env, getDefaultProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let translationMock: any;
let network: any;

describe("Send transfer validations", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		translationMock = vi.fn((index18nString: string) => index18nString);
		network = env.profiles().first().wallets().first().network();
	});

	it("recipientAddress", async () => {
		const withoutNetwork = sendTransfer(translationMock).recipientAddress(profile, undefined, [], false);

		await expect(withoutNetwork.validate.valid("")).resolves.toBe(false);

		const noAddressWithRecipients = sendTransfer(translationMock).recipientAddress(profile, network, [{}], false);

		await expect(noAddressWithRecipients.validate.valid("")).resolves.toBe(true);

		const noAddressWithoutRecipients = sendTransfer(translationMock).recipientAddress(profile, network, [], false);

		await expect(noAddressWithoutRecipients.validate.valid("")).resolves.toBe("COMMON.VALIDATION.FIELD_REQUIRED");
	});

	it("recipientAddres - invalid", async () => {
		const invalidAddress = sendTransfer(translationMock).recipientAddress(profile, network, [], false);

		await expect(invalidAddress.validate.valid("invalid")).resolves.toBe("COMMON.VALIDATION.RECIPIENT_INVALID");
	})

	it("amount", () => {
		const noBalance = sendTransfer(translationMock).amount(network, BigNumber.ZERO, [], false);

		expect(noBalance.validate.valid("1")).toBe("TRANSACTION.VALIDATION.LOW_BALANCE");

		const noAmount = sendTransfer(translationMock).amount(network, BigNumber.ONE, [], false);

		expect(noAmount.validate.valid("")).toBe("COMMON.VALIDATION.FIELD_REQUIRED");

		const amountTooSmall = sendTransfer(translationMock).amount(network, BigNumber.ONE, [], false);

		expect(amountTooSmall.validate.valid(0)).toBe("TRANSACTION.VALIDATION.AMOUNT_BELOW_MINIMUM");
	});
	it('memo', () => {
		const memo = sendTransfer(translationMock).memo();

		expect(memo.maxLength.value).toBe(255);
		expect(memo.maxLength.message).toBe("COMMON.VALIDATION.MAX_LENGTH");
	})
});
