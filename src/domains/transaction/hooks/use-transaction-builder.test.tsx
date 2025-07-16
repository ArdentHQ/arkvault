import {
	WithProviders,
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	triggerMessageSignOnce,
} from "@/utils/testing-library";
import { act as actHook, renderHook } from "@testing-library/react";
import { requestMock, server } from "@/tests/mocks/server";

import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { Services } from "@/app/lib/mainsail";
import { useTransactionBuilder } from "./use-transaction-builder";

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

		expect(transaction.hash()).toBe("b0382e77c6439f99e8c63cb171834834c4b39e6464419a83b203394c9997a508");
	});
});
