import { Enums } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import nock from "nock";

import { renderHook } from "@testing-library/react-hooks";
import { useWalletOptions } from "./use-wallet-options";
import { env, getDefaultProfileId } from "@/utils/testing-library";

describe("Wallet Options Hook", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	beforeAll(() => {
		nock("https://ark-test.arkvault.io")
			.get("/api/transactions")
			.query((parameters) => parameters.page === undefined || parameters.page === "1")
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				const unconfirmed = data[0];
				unconfirmed.confirmations = 0;
				return {
					data: [unconfirmed],
					meta,
				};
			})
			.get("/api/transactions")
			.query({ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", limit: "10", page: "2" })
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data: data.slice(1, 3),
					meta,
				};
			})
			.persist();
	});

	beforeEach(async () => {
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
				{ label: "Delegate", value: "delegate-registration" },
				{ label: "Second Signature", value: "second-signature" },
				{ label: "Multisignature", value: "multi-signature" },
			],
			title: "Register",
		});
	});

	it("should get registration options for wallet without mnemonic", () => {
		process.env.REACT_APP_IS_UNIT = "1";
		jest.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		const { result } = renderHook(() => useWalletOptions(wallet));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [
				{ label: "Delegate", value: "delegate-registration" },
				{ label: "Multisignature", value: "multi-signature" },
			],
			title: "Register",
		});

		jest.restoreAllMocks();
	});

	it("should render options for ledger wallet and disable musig option", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		jest.spyOn(wallet, "isLedger").mockReturnValue(true);
		jest.spyOn(wallet.network(), "allows").mockImplementation((key) => {
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

		jest.restoreAllMocks();
	});

	it("should render options for wallet of custom network and disable musig option", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		jest.spyOn(wallet.network(), "id").mockReturnValue("random.custom");
		const { result } = renderHook(() => useWalletOptions(wallet));

		expect(result.current.registrationOptions).toStrictEqual({
			key: "registrations",
			options: [
				{ label: "Delegate", value: "delegate-registration" },
				{ label: "Second Signature", value: "second-signature" },
			],
			title: "Register",
		});

		jest.restoreAllMocks();
	});
});
