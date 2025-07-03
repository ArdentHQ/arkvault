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
				{ label: "Multisignature", value: "multi-signature" },
			],
			title: "Register",
		});

		spy.mockRestore();
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

	it("should render options for ledger wallet and disable musig option", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.network(), "allows").mockImplementation((key) => {
			if (
				[
					Enums.FeatureFlag.TransactionMultiSignatureLedgerS,
					Enums.FeatureFlag.TransactionMultiSignatureLedgerX,
				].includes(key)
			) {
				return false;
			}

			return true;
		});

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

	it("should render options for wallet of custom network and disable musig option", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		vi.spyOn(wallet.network(), "id").mockReturnValue("random.custom");
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
});
