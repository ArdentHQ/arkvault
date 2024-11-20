import { Enums } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";

import { renderHook } from "@testing-library/react";
import { useWalletOptions } from "./use-wallet-options";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

describe("Wallet Options Hook", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		const { data, meta } = transactionsFixture;

		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{
					data: [
						{
							...data[0],
							confirmations: 0,
						},
					],
					meta,
				},
				{
					query: {
						page: null,
					},
				},
			),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{
					data: [
						{
							...data[0],
							confirmations: 0,
						},
					],
					meta,
				},
				{
					query: {
						page: 1,
					},
				},
			),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{
					data: data.slice(1, 3),
					meta,
				},
				{
					query: {
						address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
						limit: 10,
						page: 2,
					},
				},
			),
		);

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should get registration options", () => {
		process.env.REACT_APP_IS_UNIT = "1";
		const { result } = renderHook(() => useWalletOptions(wallet));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [
				{ label: "Validator", value: "delegate-registration" },
				{ label: "Multisignature", value: "multi-signature" },
			],
			title: "Register",
		});
	});

	it("should get registration options for wallet without mnemonic", () => {
		process.env.REACT_APP_IS_UNIT = "1";
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		const { result } = renderHook(() => useWalletOptions(wallet));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [
				{ label: "Validator", value: "delegate-registration" },
				{ label: "Multisignature", value: "multi-signature" },
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

		const { result } = renderHook(() => useWalletOptions(wallet));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [],
			title: "Register",
		});

		vi.restoreAllMocks();
	});

	it("should render options for wallet of custom network and disable musig option", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		vi.spyOn(wallet.network(), "id").mockReturnValue("random.custom");
		const { result } = renderHook(() => useWalletOptions(wallet));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [{ label: "Validator", value: "delegate-registration" }],
			title: "Register",
		});

		vi.restoreAllMocks();
	});

	it("should not render actions if wallet is ledger and ledger transport is incompatible ", () => {
		process.env.REACT_APP_IS_UNIT = undefined;
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		const { result } = renderHook(() => useWalletOptions(wallet));

		expect(result.current.registrationOptions).toMatchInlineSnapshot(`
			{
			  "key": "registrations",
			  "options": [],
			  "title": "Register",
			}
		`);
	});
});
