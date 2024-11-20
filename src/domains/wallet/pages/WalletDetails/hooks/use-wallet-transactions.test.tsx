import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect, useState } from "react";

import { useWalletTransactions } from "./use-wallet-transactions";
import { PendingTransaction } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable/PendingTransactionsTable.contracts";
import { env, getDefaultProfileId, render, screen, triggerMessageSignOnce, waitFor } from "@/utils/testing-library";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import { requestMock, server } from "@/tests/mocks/server";

let allPendingTransactions: PendingTransaction[];

describe("Wallet Transactions Hook", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	const fixtures: Record<string, any> = {
		multiPayment: undefined,
		multiSignature: undefined,
		transfer: undefined,
		unvote: undefined,
		vote: undefined,
	};

	const mockPendingTransfers = (wallet: Contracts.IReadWriteWallet) => {
		vi.spyOn(wallet.transaction(), "signed").mockReturnValue({
			[fixtures.transfer.id()]: fixtures.transfer,
			[fixtures.multiSignatureTransfer.id()]: fixtures.multiSignatureTransfer,
		});
		vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);
	};

	beforeEach(async () => {
		const { meta, data } = transactionsFixture;

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

		await triggerMessageSignOnce(wallet);

		fixtures.multiSignatureTransfer = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		fixtures.transfer = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	const Component = () => {
		const { syncPending, pendingTransactions } = useWalletTransactions(wallet);
		const [loading, setLoading] = useState(false);

		const run = async () => {
			setLoading(true);
			await syncPending();
			setLoading(false);
			allPendingTransactions = pendingTransactions;
		};
		return loading ? <span>Loading</span> : <button onClick={run}>Sync</button>;
	};

	it("should sync pending transfers", async () => {
		mockPendingTransfers(wallet);
		const signatory = await wallet.signatory().multiSignature({
			min: 2,
			publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
		});
		const transfer = await wallet
			.coin()
			.transaction()
			.transfer({
				data: {
					amount: 1,
					to: wallet.address(),
				},
				fee: 1,
				nonce: "1",
				signatory,
			});
		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		vi.spyOn(wallet.transaction(), "broadcasted").mockReturnValue({ 1: transfer });
		render(<Component />);
		userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(screen.queryByText("Loading")).not.toBeInTheDocument());
		await waitFor(() => expect(allPendingTransactions).toHaveLength(0));
		vi.clearAllMocks();
	});

	it("should not sync pending transfers if wallet has not been fully restored", async () => {
		mockPendingTransfers(wallet);

		const spySync = vi.spyOn(wallet.transaction(), "sync");
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);

		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);

		render(<Component />);

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(screen.queryByText("Loading")).not.toBeInTheDocument());
		await waitFor(() => expect(allPendingTransactions).toHaveLength(0));
		await waitFor(() => expect(spySync).not.toHaveBeenCalled());

		vi.clearAllMocks();
	});

	it("should sync pending multiSignature transactions", async () => {
		mockPendingTransfers(wallet);

		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		vi.spyOn(wallet.transaction(), "transaction").mockImplementation(() => fixtures.transfer);

		let allPendingTransactions: PendingTransaction[];

		const Component = () => {
			const { pendingTransactions, syncPending } = useWalletTransactions(wallet);
			allPendingTransactions = pendingTransactions;

			useEffect(() => {
				syncPending();
			}, []);

			return <span>{pendingTransactions.length}</span>;
		};

		render(<Component />);

		await waitFor(() => expect(allPendingTransactions).toHaveLength(2));

		vi.clearAllMocks();
	});

	it("should sync pending transactions", async () => {
		mockPendingTransfers(wallet);

		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		vi.spyOn(wallet.transaction(), "transaction").mockImplementation(() => fixtures.transfer);

		vi.spyOn(wallet.transaction().transaction(fixtures.transfer.id()), "usesMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);

		let allPendingTransactions: PendingTransaction[];
		// eslint-disable-next-line sonarjs/no-identical-functions
		const Component = () => {
			const { pendingTransactions, syncPending } = useWalletTransactions(wallet);
			allPendingTransactions = pendingTransactions;

			useEffect(() => {
				syncPending();
			}, []);

			return <span>{pendingTransactions.length}</span>;
		};

		render(<Component />);

		await waitFor(() => expect(allPendingTransactions).toHaveLength(2));

		vi.clearAllMocks();
	});

	it("should prevent from rendering transaction if not found in wallet", async () => {
		server.use(requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }));

		vi.spyOn(wallet.transaction(), "pending").mockReturnValue({
			[fixtures.transfer.id()]: fixtures.transfer,
		});
		vi.spyOn(wallet.transaction(), "transaction").mockImplementation(() => {
			throw new Error("not found");
		});
		vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

		let allPendingTransactions: PendingTransaction[];
		const Component = () => {
			const { pendingTransactions, syncPending } = useWalletTransactions(wallet);
			allPendingTransactions = pendingTransactions;

			useEffect(() => {
				syncPending();
			}, [syncPending]);

			return <span>{pendingTransactions.length}</span>;
		};

		render(<Component />);

		await waitFor(() => expect(allPendingTransactions).toHaveLength(0));
	});

	it("should run periodically", async () => {
		server.use(requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }));

		vi.useFakeTimers({ shouldAdvanceTime: true });
		const spySync = vi.spyOn(wallet.transaction(), "sync");

		const Component = () => {
			const { pendingTransactions, startSyncingPendingTransactions, stopSyncingPendingTransactions } =
				useWalletTransactions(wallet);

			useEffect(() => {
				startSyncingPendingTransactions();
				return () => stopSyncingPendingTransactions();
			}, []);

			return <h1>{pendingTransactions}</h1>;
		};

		render(<Component />);

		vi.advanceTimersByTime(5000);

		await waitFor(() => expect(spySync).toHaveBeenCalledWith());

		spySync.mockRestore();
		vi.useRealTimers();
	});
});
