import { Services } from "@ardenthq/sdk";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { act as actHook, renderHook } from "@testing-library/react";
import React from "react";

import { useTransactionBuilder } from "./use-transaction-builder";
import { LedgerProvider } from "@/app/contexts";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import { env, getDefaultProfileId, getDefaultWalletMnemonic, waitFor, WithProviders } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => BigNumber.make(transactionFixture.data.amount),
		data: () => ({ data: () => transactionFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
		fee: () => BigNumber.make(transactionFixture.data.fee),
		id: () => transactionFixture.data.id,
		recipient: () => transactionFixture.data.recipient,
		sender: () => transactionFixture.data.sender,
	});

describe("Use Transaction Builder with Ledger", () => {
	let wallet: Contracts.IReadWriteWallet;

	const wrapper = ({ children }: any) => (
		<WithProviders>
			<LedgerProvider>{children}</LedgerProvider>
		</WithProviders>
	);

	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	beforeEach(() => {
		server.use(requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }));
	});

	it("should sign transfer with ledger", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
		vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
			"027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582",
		);
		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue(transactionFixture.data.id);

		createTransactionMock(wallet);

		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());

		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			fee: 1,
			nonce: "1",
			signatory,
		};

		let transaction: any;

		await actHook(async () => {
			const result = await builder.current.build("transfer", input, wallet);
			transaction = result.transaction;
		});

		await waitFor(() => expect(transaction.id()).toBe(transactionFixture.data.id));

		vi.clearAllMocks();
	});

	it("should sign transfer with cold ledger wallet", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
		vi.spyOn(wallet, "publicKey").mockImplementation(() => void 0);
		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue(transactionFixture.data.id);
		createTransactionMock(wallet);

		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());
		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			fee: 1,
			nonce: "1",
			signatory,
		};

		let transaction: any;

		await actHook(async () => {
			const result = await builder.current.build("transfer", input, wallet);
			transaction = result.transaction;
		});

		expect(transaction.id()).toBe(transactionFixture.data.id);

		vi.clearAllMocks();
	});

	it("should abort build with ledger", async () => {
		const abortCtrl = new AbortController();
		const abortSignal = abortCtrl.signal;

		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.signatory(), "ledger").mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => {
						resolve();
					}, 20_000),
				),
		);

		createTransactionMock(wallet);
		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());

		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			fee: 1,
			nonce: "1",
			signatory,
		};

		setTimeout(() => abortCtrl.abort(), 100);
		let error: string;

		await actHook(async () => {
			try {
				await builder.current.build("transfer", input, wallet, { abortSignal });
			} catch (error_) {
				error = error_;
			}
		});

		await waitFor(() => expect(error).toBe("ERR_ABORT"));

		vi.clearAllMocks();
	});
});
