import { env, getDefaultProfileId } from "@/utils/testing-library";
import { renderHook, waitFor } from "@testing-library/react";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { useConfirmedTransaction } from "./useConfirmedTransaction";

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
				setMeta: () => {},
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

	it("should not make any calls when wallet is missing", async () => {
		const { result } = renderHook(() =>
			useConfirmedTransaction({
				transactionId: "123",
			}),
		);

		expect(result.current.isConfirmed).toBe(false);
	});

	it("should not make any calls when transactionId is missing", async () => {
		const { result } = renderHook(() =>
			useConfirmedTransaction({
				wallet: wallet,
			}),
		);

		expect(result.current.isConfirmed).toBe(false);
	});

	it("should set transaction meta when wallet is present", async () => {
		const setMetaSpy = vi.fn();
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: () => ({
				confirmations: () => BigNumber.make(1),
				id: () => "123",
				setMeta: setMetaSpy,
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

		expect(setMetaSpy).toHaveBeenCalledWith("publicKey", wallet.publicKey());
		expect(setMetaSpy).toHaveBeenCalledWith("address", wallet.address());
	});

	it("should ignore errors when transaction is not confirmed", async () => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: () => {
				throw new Error("Transaction not found");
			},
		}));

		const { result } = renderHook(() =>
			useConfirmedTransaction({
				transactionId: "123",
				wallet: wallet,
			}),
		);

		await waitFor(
			() => {
				expect(result.current.isConfirmed).toBe(false);
			},
			{ timeout: 3000 },
		);
	});
});
