/* eslint-disable sonarjs/no-duplicate-string */

import { env, getDefaultProfileId, t } from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { sendTransfer } from "./SendTransfer";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { AddressService } from "@/app/lib/mainsail/address.service";

let profile: Contracts.IProfile;
let network: any;

describe("Send transfer validations", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
		network = env.profiles().first().wallets().first().network();
	});

	describe("Amount", () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should pass", () => {
			const { validate } = sendTransfer(t).amount(network, "10", [], true);
			expect(validate.valid("5")).toBe(true);
		});

		it("should pass if not required", () => {
			const { validate } = sendTransfer(t).amount(network, "10", [{} as RecipientItem], false);
			expect(validate.valid("")).toBe(true);
		});

		it("should fail with insufficient balance", () => {
			const { validate } = sendTransfer(t).amount(network, "5", [], true);
			expect(validate.valid("10")).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE", { balance: "5", coinId: network.coin() }),
			);
		});

		it("should fail with undefined balance", () => {
			const { validate } = sendTransfer(t).amount(network, undefined, [], true);
			expect(validate.valid("10")).toBe(t("TRANSACTION.VALIDATION.LOW_BALANCE", { coinId: network.coin() }));
		});

		it("should fail if required but empty", () => {
			const { validate } = sendTransfer(t).amount(network, "10", [], true);
			expect(validate.valid("")).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.AMOUNT") }));
		});

		it("should fail with zero amount", () => {
			const { validate } = sendTransfer(t).amount(network, "10", [], true);
			expect(validate.valid("0")).toBe(
				t("TRANSACTION.VALIDATION.AMOUNT_BELOW_MINIMUM", { coinId: network.coin(), min: "0.00000001" }),
			);
		});
	});

	describe("Memo", () => {
		it("should return max length validation", () => {
			const { maxLength } = sendTransfer(t).memo();
			expect(maxLength.value).toBe(255);
			expect(maxLength.message).toBe(
				t("COMMON.VALIDATION.MAX_LENGTH", { field: t("COMMON.MEMO"), maxLength: 255 }),
			);
		});
	});

	describe("Network", () => {
		it("should return required validation", () => {
			const { required } = sendTransfer(t).network();
			expect(required).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.CRYPTOASSET") }));
		});
	});

	describe("Recipient Address", () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should pass with a valid address", () => {
			vi.spyOn(AddressService.prototype, "validate").mockReturnValue(true);

			const { validate } = sendTransfer(t).recipientAddress(profile, network, [], true);
			expect(validate.valid("D8rr7B1d63MScbDEkMyk5q4eC2ahK1Y71p")).toBe(true);
		});

		it("should pass if not single recipient and has recipients", () => {
			const recipients = [{} as RecipientItem];
			const { validate } = sendTransfer(t).recipientAddress(profile, network, recipients, false);
			expect(validate.valid(undefined)).toBe(true);
		});

		it("should fail without a network", () => {
			const { validate } = sendTransfer(t).recipientAddress(profile, undefined, [], true);
			expect(validate.valid("anything")).toBe(false);
		});

		it("should fail if required but empty", () => {
			const { validate } = sendTransfer(t).recipientAddress(profile, network, [], true);
			expect(validate.valid("")).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.RECIPIENT") }));
		});

		it("should fail with an invalid address", () => {
			vi.spyOn(AddressService.prototype, "validate").mockReturnValue(false);

			const { validate } = sendTransfer(t).recipientAddress(profile, network, [], true);
			expect(validate.valid("invalid-address")).toBe(t("COMMON.VALIDATION.RECIPIENT_INVALID"));
		});
	});

	describe("Recipients", () => {
		it("should fail with an empty array", () => {
			const { validate } = sendTransfer(t).recipients();
			expect(validate.valid([])).toBe(false);
		});

		it("should pass with items in array", () => {
			const { validate } = sendTransfer(t).recipients();
			expect(validate.valid([{} as RecipientItem])).toBe(true);
		});
	});

	describe("Sender Address", () => {
		it("should return required validation", () => {
			const { required } = sendTransfer(t).senderAddress();
			expect(required).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.SENDER_ADDRESS") }));
		});
	});
});
