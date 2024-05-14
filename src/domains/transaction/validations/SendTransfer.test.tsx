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

	it("recipients", () => {
		const withRecipients = sendTransfer(translationMock).recipients();

		expect(withRecipients.validate.valid([{}])).toBe(true);

		const withoutRecipients = sendTransfer(translationMock).recipients();

		expect(withoutRecipients.validate.valid([])).toBe(false);
	});

	it("recipientAddress", async () => {
		const withoutNetwork = sendTransfer(translationMock).recipientAddress(profile, undefined, [], false);

		await expect(withoutNetwork.validate.valid("")).resolves.toBe(false);

		const noAddressWithRecipients = sendTransfer(translationMock).recipientAddress(profile, network, [{}], false);

		await expect(noAddressWithRecipients.validate.valid("")).resolves.toBe(true);

		const noAddressWithoutRecipients = sendTransfer(translationMock).recipientAddress(profile, network, [], false);

		await expect(noAddressWithoutRecipients.validate.valid("")).resolves.toBe("COMMON.VALIDATION.FIELD_REQUIRED");
	});

	it("recipientAddress async validation", async () => {
		const coin = profile.coins().set(network.coin(), network.id());
		const profileCoinSpy = vi.spyOn(profile.coins(), "set").mockReturnValue(coin);
		const validateSpy = vi
			.spyOn(coin.address(), "validate")
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(false);

		const transfer = sendTransfer(translationMock).recipientAddress(profile, network, [], false);

		await expect(transfer.validate.valid("0xadress")).resolves.toBe(true);

		await expect(transfer.validate.valid("0xadress")).resolves.toBe("COMMON.VALIDATION.RECIPIENT_INVALID");

		profileCoinSpy.mockRestore();
		validateSpy.mockRestore();
	});

	it("amount", () => {
		const withbalance = sendTransfer(translationMock).amount(network, BigNumber.ONE, [], false);

		expect(withbalance.validate.valid("0.5")).toBeTrue();

		const noBalance = sendTransfer(translationMock).amount(network, BigNumber.ZERO, [], false);

		expect(noBalance.validate.valid("1")).toBe("TRANSACTION.VALIDATION.LOW_BALANCE");

		const noBalanceDefault = sendTransfer(translationMock).amount(network, undefined, [], false);

		expect(noBalanceDefault.validate.valid("0")).toBe("TRANSACTION.VALIDATION.LOW_BALANCE");

		const noAmount = sendTransfer(translationMock).amount(network, BigNumber.ONE, [], false);

		expect(noAmount.validate.valid("")).toBe("COMMON.VALIDATION.FIELD_REQUIRED");

		const amountTooSmall = sendTransfer(translationMock).amount(network, BigNumber.ONE, [], false);

		expect(amountTooSmall.validate.valid(0)).toBe("TRANSACTION.VALIDATION.AMOUNT_BELOW_MINIMUM");
	});

	it("memo", () => {
		const memo = sendTransfer(translationMock).memo();

		expect(memo.maxLength.value).toBe(255);
	});

	it("network", () => {
		const emptyMemo = sendTransfer(translationMock).network();

		expect(emptyMemo.required).toBe("COMMON.VALIDATION.FIELD_REQUIRED");
	});

	it("senderAddress", () => {
		const emptyMemo = sendTransfer(translationMock).senderAddress();

		expect(emptyMemo.required).toBe("COMMON.VALIDATION.FIELD_REQUIRED");
	});
});
