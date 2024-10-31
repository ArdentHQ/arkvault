import { renderHook } from "@testing-library/react";

import { env, waitFor, MNEMONICS } from "@/utils/testing-library";
import { useIpfsStubTransaction, useMusigRegistrationStubTransaction } from "./use-stub-transaction";

describe("IPFS Stub Transaction", () => {
	const hash = "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2";
	it("should handle exception and return undefined", () => {
		const {
			result: { current },
		} = renderHook(() =>
			useIpfsStubTransaction({
				fee: 10,
				hash: "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2",
				wallet: env.profiles().first().wallets().first(),
			}),
		);

		expect(current.ipfsStubTransaction).toBeUndefined();
	});

	it("should create ipfs stub transaction", async () => {
		const wallet = env.profiles().first().wallets().first();

		const signatory = await wallet.signatory().stub(MNEMONICS[0]);
		const signatoryMock = vi.spyOn(wallet.signatory(), "secret").mockResolvedValue(signatory);

		const ipfsStubTransactionMock = vi.spyOn(wallet.coin().transaction(), "ipfs").mockResolvedValue({
			fee: () => "10",
			hash: () => "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2",
			sender: () => wallet.address(),
		});

		renderHook(() =>
			useIpfsStubTransaction({
				fee: 10,
				hash,
				wallet,
			}),
		);

		await waitFor(() => {
			expect(signatoryMock).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(ipfsStubTransactionMock).toHaveBeenCalled();
		});
	});
});

describe("Multisignature Registration Stub Transaction", () => {
	it("should handle exception and return undefined", () => {
		const wallet = env.profiles().first().wallets().first();

		const {
			result: { current },
		} = renderHook(() =>
			useMusigRegistrationStubTransaction({
				min: 1,
				publicKeys: [wallet.address()],
			}),
		);

		expect(current.musigRegistrationStubTransaction).toBeUndefined();
	});

	it("should create musig registration stub transaction", async () => {
		const wallet = env.profiles().first().wallets().first();
		const wallet2 = env.profiles().first().wallets().last();

		const signatory = await wallet
			.coin()
			.signatory()
			.multiSignature({
				min: 2,
				publicKeys: [wallet.publicKey(), wallet2.publicKey()],
			});

		const signatoryMock = vi.spyOn(wallet.signatory(), "multiSignature").mockResolvedValue(signatory);

		const musigRegistrationStubTransaction = vi
			.spyOn(wallet.coin().transaction(), "multiSignature")
			.mockResolvedValue({
				fee: () => "10",
				publicKeys: () => [wallet.publicKey()],
			});

		renderHook(() =>
			useMusigRegistrationStubTransaction({
				fee: 10,
				publicKeys: [wallet.publicKey(), wallet2.publicKey()],
				wallet,
			}),
		);

		await waitFor(() => {
			expect(signatoryMock).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(musigRegistrationStubTransaction).toHaveBeenCalled();
		});
	});
});
