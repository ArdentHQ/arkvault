import { Enums } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";

import { renderHook } from "@testing-library/react-hooks";
import { useWalletOptions } from "./use-wallet-options";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { server } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import { rest } from "msw";

describe("Wallet Options Hook", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		server.use(
			rest.get("https://ark-test.arkvault.io/api/transactions", (request, response, context) => {
				const address = request.url.searchParams.get("page");
				const limit = request.url.searchParams.get("page");
				const page = request.url.searchParams.get("page");

				const { data, meta } = transactionsFixture;

				if (page === undefined || page === "1") {
					const unconfirmed = data[0];
					unconfirmed.confirmations = 0;

					return response(context.status(200), context.json({
						data: [unconfirmed],
						meta,
					}));
				}

				if (address === "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" && limit === "10" && page === "2") {
					return response(context.status(200), context.json({
						data: data.slice(1, 3),
						meta,
					}));
				}
			}),
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
				{ label: "Delegate", value: "delegate-registration" },
				{ label: "Second Signature", value: "second-signature" },
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
				{ label: "Delegate", value: "delegate-registration" },
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
			options: [
				{ label: "Delegate", value: "delegate-registration" },
				{ label: "Second Signature", value: "second-signature" },
			],
			title: "Register",
		});

		vi.restoreAllMocks();
	});
});
