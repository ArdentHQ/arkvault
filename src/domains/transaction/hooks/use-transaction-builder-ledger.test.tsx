import { WithProviders, env, getDefaultProfileId, getDefaultWalletMnemonic, waitFor } from "@/utils/testing-library";
import { act as actHook, renderHook } from "@testing-library/react";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { LedgerProvider } from "@/app/contexts";
import React from "react";
import { Services } from "@/app/lib/mainsail";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { useTransactionBuilder } from "./use-transaction-builder";

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		data: () => ({ data: () => transactionFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.hash}`,
		from: () => transactionFixture.data.from,
		gasPrice: () => BigNumber.make(transactionFixture.data.gasPrice),
		hash: () => transactionFixture.data.hash,
		nonce: () => BigNumber.make(1),
		to: () => transactionFixture.data.to,
		value: () => BigNumber.make(transactionFixture.data.value),
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

		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue(transactionFixture.data.hash);

		createTransactionMock(wallet);

		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());

		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			gasLimit: 1,
			gasPrice: 1,
			nonce: "1",
			signatory,
		};

		let transaction: any;

		await actHook(async () => {
			const result = await builder.current.build("transfer", input, wallet);
			transaction = result.transaction;
		});

		await waitFor(() => expect(transaction.hash()).toBe(transactionFixture.data.hash));

		vi.clearAllMocks();
	});

	it("should sign transfer with cold ledger wallet", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue(transactionFixture.data.hash);

		createTransactionMock(wallet);

		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());
		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			gasLimit: 1,
			gasPrice: 1,
			nonce: "1",
			signatory,
		};

		let transaction: any;

		await actHook(async () => {
			const result = await builder.current.build("transfer", input, wallet);
			transaction = result.transaction;
		});

		expect(transaction.hash()).toBe(transactionFixture.data.hash);

		vi.clearAllMocks();
	});

	it("should abort build with ledger", async () => {
		const abortCtrl = new AbortController();
		const abortSignal = abortCtrl.signal;

		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet, "signatory").mockImplementation(() => ({
			ledger: vi.fn().mockResolvedValue(new Promise((resolve) => setTimeout(() => resolve(), 20_000))),
			mnemonic: vi.fn().mockResolvedValue(getDefaultWalletMnemonic()),
		}));

		createTransactionMock(wallet);

		createTransactionMock(wallet);
		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());

		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			gasLimit: 1,
			gasPrice: 1,
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
