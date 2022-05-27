import { Contracts, DTO } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";

import { useMultiSignatureStatus } from "./use-multisignature-status";
import { env, getDefaultProfileId } from "@/utils/testing-library";

describe("Use MultiSignature Status Hook", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transaction: DTO.ExtendedSignedTransactionData;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		transaction = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.multiSignature({
					data: {
						min: 2,
						publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						senderPublicKey: wallet.publicKey()!,
					},
					fee: 1,
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

	it("should await our signature", () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurSignature");

		jest.clearAllMocks();
	});

	it("should await our signature as participant", () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		jest.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(2);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurSignature");

		jest.clearAllMocks();
	});

	it("should await our broadcast", () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		jest.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(0);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurFinalSignature");

		jest.clearAllMocks();
	});

	it("should await other signatures", () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOtherSignatures");

		jest.clearAllMocks();
	});

	it("should await confirmation", () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingConfirmation");

		jest.clearAllMocks();
	});

	it("should be multisignature ready", () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurFinalSignature");

		jest.clearAllMocks();
	});

	it("should await final signature", () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(false);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingFinalSignature");

		jest.clearAllMocks();
	});

	it("should be able to broadcast only", () => {
		jest.spyOn(wallet, "address").mockReturnValue("1");
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		jest.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(0);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isMultiSignatureReady");

		jest.clearAllMocks();
	});
});
