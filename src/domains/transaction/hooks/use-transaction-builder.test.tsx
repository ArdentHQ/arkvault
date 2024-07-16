import { Services } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { act as actHook, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { useTransactionBuilder } from "./use-transaction-builder";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	triggerMessageSignOnce,
	WithProviders,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

describe("Use Transaction Builder Hook", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	const wrapper = ({ children }: any) => <WithProviders>{children}</WithProviders>;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await profile.sync();

		await triggerMessageSignOnce(wallet);
	});

	beforeEach(() => {
		server.use(requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }));
	});

	it("should fail sign transfer if invalid data", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());
		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			signatory,
		};

		await expect(async () => {
			await builder.current.build("transfer", input, wallet);
		}).rejects.toThrow();
	});

	it("should sign transfer", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

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

		expect(transaction.id()).toBe("bad2e9a02690d7cb0efdddfff1f7eacdf4685e22c0b5c3077e1de67511e2553d");
	});

	it("should sign transfer with multisignature wallet", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		vi.spyOn(wallet, "isMultiSignature").mockImplementation(() => true);
		vi.spyOn(wallet.multiSignature(), "all").mockReturnValue({
			min: 2,
			publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
		});

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

		expect(transaction.id()).toBe("6c38de343321f7d853ff98c1669aecee429ed51c13a473f6d39e3037d6685da4");

		vi.clearAllMocks();
	});
});
