
import { renderHook } from "@testing-library/react";
import React from "react";

import { useProfileTransactions } from "./use-profile-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, syncDelegates, waitFor, MNEMONICS } from "@/utils/testing-library";
import { useIpfsStubTransaction } from "./use-stub-transaction"

describe("IPFS Stub Transaction", () => {
	const hash = "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2"
	it("should handle exception and return undefined", async () => {
		const { result: { current } } = renderHook(() => useIpfsStubTransaction({
			fee: 10,
			hash: "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2",
			wallet: env.profiles().first().wallets().first(),
		}))

		expect(current.ipfsStubTransaction).toBeUndefined();
	})

	it("should handle exception and return undefined", async () => {
		const wallet = env.profiles().first().wallets().first();

		const signatory = await wallet.signatory().stub(MNEMONICS[0])
		const signatoryMock = vi.spyOn(wallet.signatory(), "secret").mockResolvedValue();

		const ipfsStubTransactionMock = vi.spyOn(wallet.coin().transaction(), "ipfs").mockResolvedValue({
			fee: () => "10",
			hash: () => "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2",
			sender: () => wallet.address()
		})

		const { result: { current } } = renderHook(() => useIpfsStubTransaction({
			fee: 10,
			hash,
			wallet,
		}))

		await waitFor(() => {
			expect(signatoryMock).toHaveBeenCalled();
		})

		await waitFor(() => {
			expect(ipfsStubTransactionMock).toHaveBeenCalled();
		})
	})
});
