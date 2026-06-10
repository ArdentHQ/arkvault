import { Contracts } from "@/app/lib/profiles";
import { validatorRegistration } from "./ValidatorRegistration";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";
import { Networks } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";
import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import { MNEMONICS } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let translationMock: any;
let network: Networks.Network;
let wallet: Contracts.IReadWriteWallet;

const getValues = () => ({
	gasLimit: BigNumber.make(10),
	gasPrice: BigNumber.make(10),
});

describe("Register validator validation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();

		network = profile.wallets().first().network();

		await env.profiles().restore(profile);

		await profile.sync();

		translationMock = vi.fn((index18nString: string) => index18nString);
	});

	it("should return a required message", () => {
		const { required } = validatorRegistration(translationMock).validatorPassphrase(profile, network);

		expect(required).toBe("COMMON.VALIDATION.FIELD_REQUIRED");
	});

	it("should validate passphrase", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);

		await expect(validate.pattern(MNEMONICS[2])).toBe(true);
	});

	it("should fail to validate passphrase", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);

		await expect(validate.pattern("test")).not.toBe(true);
	});

	it("should fail with an empty passphrase", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);

		await expect(validate.unique("")).resolves.toBeTruthy();
	});

	it("should pass if public key hasn't used", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);

		// Emulate public key hasn't used
		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/wallets",
				{ meta: { count: 0 } },
				{
					query: {
						"attributes.validatorPublicKey":
							"a3e98fdd447160dc521a0bf01fea1d08a0797decc2d833c9889ca5c0c2114cb9094356684bf8601d742d603492e1902a",
					},
				},
			),
		);

		await expect(validate.unique(MNEMONICS[2])).resolves.toBeFalsy();
	});

	it("should handle exception", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);

		await expect(validate.unique("invalid-mnemonic")).resolves.toBe(
			"COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS",
		);
	});

	it("should pass if the server returns a response without meta", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);
		const validatorPassphrase = MNEMONICS[2];

		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/wallets",
				{ data: [] }, // No meta property
				{
					query: {
						"attributes.validatorPublicKey":
							"a3e98fdd447160dc521a0bf01fea1d08a0797decc2d833c9889ca5c0c2114cb9094356684bf8601d742d603492e1902a",
					},
				},
			),
		);

		await expect(validate.unique(validatorPassphrase)).resolves.toBeFalsy();
	});

	it("should pass if the server returns 404", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);
		const validatorPassphrase = MNEMONICS[2];
		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/wallets",
				{},
				{
					query: {
						"attributes.validatorPublicKey":
							"a3e98fdd447160dc521a0bf01fea1d08a0797decc2d833c9889ca5c0c2114cb9094356684bf8601d742d603492e1902a",
					},
					status: 404,
				},
			),
		);

		await expect(validate.unique(validatorPassphrase)).resolves.toBeFalsy();
	});

	it("should fail if public key was used", async () => {
		vi.spyOn(profile.validators(), "publicKeyExists").mockResolvedValue(true);
		const { validate } = validatorRegistration(translationMock).validatorPassphrase(profile, network);

		await expect(validate.unique(MNEMONICS[2])).resolves.toBe(
			"COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS",
		);
	});
});

describe("lockedFee", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();
		translationMock = (key: string) => key;
	});

	beforeEach(() => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(false);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return a required message", () => {
		const { required } = validatorRegistration(translationMock).lockedFee(wallet, () => ({}));

		expect(required).toBe("COMMON.VALIDATION.FIELD_REQUIRED");
	});

	it("should not return an error for insufficient balance if already a validator", () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(true);

		const walletBalance = 0;
		vi.spyOn(wallet, "balance").mockReturnValue(walletBalance);

		const lockedFee = 100;

		const { validate } = validatorRegistration(translationMock).lockedFee(wallet, () => ({}));

		const result = validate.insufficientBalance(lockedFee);

		expect(result).toBe(true);
	});

	it("should return an error for insufficient balance for locked fee", () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(false);

		const walletBalance = 0;
		vi.spyOn(wallet, "balance").mockReturnValue(walletBalance);

		const lockedFee = 100;

		const { validate } = validatorRegistration(translationMock).lockedFee(wallet, () => ({}));

		const result = validate.insufficientBalance(lockedFee);

		expect(result).toBe("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.INSUFFICIENT_BALANCE_FOR_LOCKED_FEE");
	});

	it("should return an error for insufficient balance for fee and locked fee", () => {
		const { validate } = validatorRegistration(translationMock).lockedFee(wallet, getValues);

		const walletBalance = 0;
		vi.spyOn(wallet, "balance").mockReturnValue(walletBalance);
		const lockedFee = 100;

		const result = validate.insufficientBalance(lockedFee);

		expect(result).toBe(
			"TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.INSUFFICIENT_BALANCE_FOR_FEE_AND_LOCKED_FEE",
		);
	});

	it("should return true if the balance is sufficient", () => {
		const { validate } = validatorRegistration(translationMock).lockedFee(wallet, getValues);
		const walletBalance = 10_000_000_000;
		vi.spyOn(wallet, "balance").mockReturnValue(walletBalance);
		const lockedFee = 100;

		const result = validate.insufficientBalance(lockedFee);

		expect(result).toBe(true);
	});

	it("should handle undefined wallet gracefully", () => {
		const { validate } = validatorRegistration(translationMock).lockedFee(undefined, () => ({}));
		const lockedFee = 100;
		const result = validate.insufficientBalance(lockedFee);
		expect(result).toBe("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.INSUFFICIENT_BALANCE_FOR_LOCKED_FEE");
	});

	it("should handle undefined wallet gracefully with fees", () => {
		const { validate } = validatorRegistration(translationMock).lockedFee(undefined, getValues);
		const lockedFee = 100;
		const result = validate.insufficientBalance(lockedFee);
		expect(result).toBe(
			"TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.INSUFFICIENT_BALANCE_FOR_FEE_AND_LOCKED_FEE",
		);
	});
});
