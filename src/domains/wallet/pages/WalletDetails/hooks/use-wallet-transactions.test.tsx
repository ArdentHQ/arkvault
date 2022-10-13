import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect, useState } from "react";

import { useWalletTransactions } from "./use-wallet-transactions";
import { PendingTransaction } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable/PendingTransactionsTable.contracts";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { transactionsFixture } from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import { rest } from "msw";
import { requestMock, server } from "@/tests/mocks/server";

let allPendingTransactions: PendingTransaction[];

describe("Wallet Transactions Hook", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	const fixtures: Record<string, any> = {
		ipfs: undefined,
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
		server.use(
			rest.get("https://ark-test.arkvault.io/api/transactions", (request, response, context) => {
				const address = request.url.searchParams.get("address");
				const limit = request.url.searchParams.get("limit");
				const page = request.url.searchParams.get("page");

				const { meta, data } = transactionsFixture;

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
					signatory: await wallet.coin().signatory().secret("123"),
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

		await waitFor(() => expect(allPendingTransactions).toHaveLength(1));

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

		await waitFor(() => expect(allPendingTransactions).toHaveLength(1));

		vi.clearAllMocks();
	});

	it("should prevent from rendering transaction if not found in wallet", async () => {
		server.use(
			requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }),
		);

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
		server.use(
			requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }),
		);

		vi.useFakeTimers();
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
