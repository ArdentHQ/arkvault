/* eslint-disable sonarjs/no-duplicate-string */
import { Enums } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";

import { renderHook } from "@testing-library/react";
import { useWalletOptions } from "./use-wallet-options";
import { env, getMainsailProfileId } from "@/utils/testing-library";

describe("Wallet Options Hook", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should get registration options", () => {
		process.env.REACT_APP_IS_UNIT = "1";
		const { result } = renderHook(() => useWalletOptions([wallet]));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [
				{ label: "Update Validator", value: "validator-registration" },
				{ label: "Resign Validator", value: "validator-resignation" },
				{ label: "Username", value: "username-registration" },
				{ label: "Resign Username", value: "username-resignation" },
			],
			title: "Register",
		});
	});

	it("should get registration/resignation options", () => {
		process.env.REACT_APP_IS_UNIT = "1";
		const spy = vi.spyOn(wallet, "username").mockReturnValue("test_username");
		const networkSpy = vi.spyOn(wallet.network(), "allows").mockReturnValue(true);

		const { result } = renderHook(() => useWalletOptions([wallet]));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [
				{ label: "Update Validator", value: "validator-registration" },
				{ label: "Resign Validator", value: "validator-resignation" },
				{ label: "Username", value: "username-registration" },
				{ label: "Resign Username", value: "username-resignation" },
			],
			title: "Register",
		});

		spy.mockRestore();
		networkSpy.mockRestore();
	});

	it.each([
		["Sign Message", Enums.FeatureFlag.MessageSign, "additionalOptions", "sign-message"],
		["Message Verify", Enums.FeatureFlag.MessageVerify, "additionalOptions", "verify-message"],
		[
			"Username Registration",
			Enums.FeatureFlag.TransactionUsernameRegistration,
			"registrationOptions",
			"username-registration",
		],
		[
			"Validator Registration",
			Enums.FeatureFlag.TransactionValidatorRegistration,
			"registrationOptions",
			"validator-registration",
		],
		[
			"Validator Resignation",
			Enums.FeatureFlag.TransactionValidatorResignation,
			"registrationOptions",
			"validator-resignation",
		],
	])("should not enable `%s` when flag is disabled", (_description, flag, type, option) => {
		const networkSpy = vi.spyOn(wallet.network(), "allows").mockImplementation((key) => key !== flag);

		const { result } = renderHook(() => useWalletOptions([wallet]));

		expect(result.current[type].options.some((opt) => opt.value === option)).toBe(false);

		networkSpy.mockRestore();
	});

	it("should get registration options for wallet without mnemonic", () => {
		process.env.REACT_APP_IS_UNIT = "1";
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		const { result } = renderHook(() => useWalletOptions([wallet]));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [
				{ label: "Update Validator", value: "validator-registration" },
				{ label: "Resign Validator", value: "validator-resignation" },
				{ label: "Username", value: "username-registration" },
				{ label: "Resign Username", value: "username-resignation" },
			],
			title: "Register",
		});

		vi.restoreAllMocks();
	});

	it("should not render actions if wallet is ledger and ledger transport is incompatible ", () => {
		process.env.REACT_APP_IS_UNIT = undefined;
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		const { result } = renderHook(() => useWalletOptions([wallet]));

		expect(result.current.registrationOptions).toMatchInlineSnapshot(`
			{
			  "key": "registrations",
			  "options": [
			    {
			      "label": "Update Validator",
			      "value": "validator-registration",
			    },
			    {
			      "label": "Resign Validator",
			      "value": "validator-resignation",
			    },
			    {
			      "label": "Username",
			      "value": "username-registration",
			    },
			    {
			      "label": "Resign Username",
			      "value": "username-resignation",
			    },
			  ],
			  "title": "Register",
			}
		`);
	});

	it("should not render secondary options when multiple wallets passed", () => {
		process.env.REACT_APP_IS_UNIT = "1";
		const { result } = renderHook(() => useWalletOptions([wallet, profile.wallets().last()]));

		expect(result.current.secondaryOptions).toStrictEqual({
			hasDivider: true,
			key: "secondary",
			options: [],
		});
	});

	it("should render HD account name option", () => {
		vi.spyOn(wallet, "accountName").mockReturnValue("accountName");

		const { result } = renderHook(() => useWalletOptions([wallet]));

		expect(result.current.primaryOptions.options.some((opt) => opt.value === "hd-account-name")).toBe(true);
	});
});
