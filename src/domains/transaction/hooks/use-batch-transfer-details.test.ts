import { renderHook } from "@testing-library/react";

import { Contracts } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { calculateTotalAmount, useBatchTransferDetails } from "./use-batch-transfer-details";

const tokenContractAddress = Fixtures.ByContractAddress.data.address;

describe("calculateTotalAmount", () => {
	it("should return zero for an empty list of recipients", () => {
		expect(calculateTotalAmount([]).isEqualTo(BigNumber.ZERO)).toBe(true);
	});

	it("should sum numeric amounts", () => {
		expect(calculateTotalAmount([{ amount: 1 }, { amount: 2 }]).isEqualTo(3)).toBe(true);
	});

	it("should sum string amounts", () => {
		expect(calculateTotalAmount([{ amount: "1.5" }, { amount: "2.5" }]).isEqualTo(4)).toBe(true);
	});

	it("should treat a missing amount as zero", () => {
		expect(calculateTotalAmount([{ amount: 1 }, {}]).isEqualTo(1)).toBe(true);
	});
});

describe("useBatchTransferDetails", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		wallet.tokens().create({
			token: new TokenDTO(Fixtures.ByContractAddress.data),
			walletToken: new WalletTokenDTO(Fixtures.ByWalletAddress.data[0]),
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return the total amount for the given recipients", () => {
		const { result } = renderHook(() =>
			useBatchTransferDetails({
				profile,
				recipients: [{ address: "0x000001", amount: "1" }, { address: "0x000002", amount: "2" }],
				tokenContractAddress,
				wallet,
			}),
		);

		expect(result.current.amount.isEqualTo(3)).toBe(true);
	});

	it("should return the wallet token matching the token contract address", () => {
		const { result } = renderHook(() =>
			useBatchTransferDetails({
				profile,
				recipients: [],
				tokenContractAddress,
				wallet,
			}),
		);

		expect(result.current.walletToken.token().address()).toBe(tokenContractAddress);
	});

	it("should return a converted amount of zero on test networks", () => {
		vi.spyOn(wallet.network(), "isTest").mockReturnValue(true);

		const { result } = renderHook(() =>
			useBatchTransferDetails({
				profile,
				recipients: [{ address: "0x000001", amount: "1" }],
				tokenContractAddress,
				wallet,
			}),
		);

		expect(result.current.convertedAmount).toBe(0);
	});

	it("should convert the amount using the exchange rate on live networks", () => {
		vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);
		vi.spyOn(profile.settings(), "get").mockReturnValue("USD");
		const exchangeMock = vi.spyOn(profile.exchangeRates(), "exchange").mockReturnValue(42);

		const { result } = renderHook(() =>
			useBatchTransferDetails({
				profile,
				recipients: [{ address: "0x000001", amount: "1" }],
				tokenContractAddress,
				wallet,
			}),
		);

		expect(exchangeMock).toHaveBeenCalled();
		expect(result.current.convertedAmount).toBe(42);
		expect(result.current.exchangeTicker).toBe("USD");
	});
});
