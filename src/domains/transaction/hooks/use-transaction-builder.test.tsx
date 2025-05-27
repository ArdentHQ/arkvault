import { Services } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { act as actHook, renderHook } from "@testing-library/react";
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
			gasLimit: 1,
			gasPrice: 1,
			nonce: "1",
			signatory,
		};

		let transaction: any;

		await actHook(async () => {
			const result = await builder.current.build("transfer", input, wallet);
			transaction = result.transaction;
			console.log(transaction.hash());
		});

		expect(transaction.hash()).toBe("a9c0f8086cb2ecc8b9744620f7ef967013d9c23ce311475a4c2de85f60d94498");
	});
});
