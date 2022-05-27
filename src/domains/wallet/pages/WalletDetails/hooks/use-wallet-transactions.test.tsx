import { Contracts, DTO } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React, { useEffect, useState } from "react";

import { useWalletTransactions } from "./use-wallet-transactions";
import { PendingTransaction } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable/PendingTransactionsTable.contracts";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

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
		jest.spyOn(wallet.transaction(), "signed").mockReturnValue({
			[fixtures.transfer.id()]: fixtures.transfer,
			[fixtures.multiSignatureTransfer.id()]: fixtures.multiSignatureTransfer,
		});
		jest.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		jest.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(true);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);
	};

	beforeAll(() => {
		nock("https://ark-test.payvo.com")
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

		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "broadcasted").mockReturnValue({ 1: transfer });

		render(<Component />);

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(screen.queryByText("Loading")).not.toBeInTheDocument());
		await waitFor(() => expect(allPendingTransactions).toHaveLength(0));

		jest.clearAllMocks();
	});

	it("should not sync pending transfers if wallet has not been fully restored", async () => {
		mockPendingTransfers(wallet);

		const spySync = jest.spyOn(wallet.transaction(), "sync");
		jest.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);

		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);

		render(<Component />);

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(screen.queryByText("Loading")).not.toBeInTheDocument());
		await waitFor(() => expect(allPendingTransactions).toHaveLength(0));
		await waitFor(() => expect(spySync).not.toHaveBeenCalled());

		jest.clearAllMocks();
	});

	it("should sync pending multiSignature transactions", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "transaction").mockImplementation(() => fixtures.transfer);

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
	});

	it("should sync pending transactions", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "transaction").mockImplementation(() => fixtures.transfer);

		jest.spyOn(wallet.transaction().transaction(fixtures.transfer.id()), "usesMultiSignature").mockReturnValue(
			false,
		);
		jest.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);

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
	});

	it("should prevent from rendering transaction if not found in wallet", async () => {
		jest.spyOn(wallet.transaction(), "pending").mockReturnValue({
			[fixtures.transfer.id()]: fixtures.transfer,
		});
		jest.spyOn(wallet.transaction(), "transaction").mockImplementation(() => {
			throw new Error("not found");
		});
		jest.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		jest.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

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
		jest.useFakeTimers();
		const spySync = jest.spyOn(wallet.transaction(), "sync");

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

		jest.advanceTimersByTime(5000);

		await waitFor(() => expect(spySync).toHaveBeenCalledWith());

		spySync.mockRestore();
		jest.useRealTimers();
	});
});
