import { env, getDefaultProfileId } from "@/utils/testing-library";
import { renderHook, waitFor } from "@testing-library/react";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { useConfirmedTransaction } from "./useConfirmedTransaction";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("useConfirmedTransaction", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should initially set isConfirmed to false", () => {
		const { result } = renderHook(() =>
			useConfirmedTransaction({
				transactionId: "123",
				wallet: wallet,
			}),
		);
		expect(result.current.isConfirmed).toBe(false);
	});

	it("should set isConfirmed to true when transaction is found", async () => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: () => ({
				confirmations: () => BigNumber.make(1),
				id: () => "123",
			}),
		}));

		const { result } = renderHook(() =>
			useConfirmedTransaction({
				transactionId: "123",
				wallet: wallet,
			}),
		);

		await waitFor(
			() => {
				expect(result.current.isConfirmed).toBe(true);
			},
			{ timeout: 5000 },
		);
	});

	it("should not make any calls when disabled", async () => {
		const clientMock = vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: () => ({
				confirmations: () => BigNumber.make(1),
				id: () => "123",
			}),
		}));

		renderHook(() =>
			useConfirmedTransaction({
				disabled: true,
				transactionId: "123",
				wallet: wallet,
			}),
		);

		expect(clientMock).not.toHaveBeenCalled();
	});
});
