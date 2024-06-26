import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

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
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurSignature");

		vi.clearAllMocks();
	});

	it("should await our signature as participant", () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		vi.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(2);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurSignature");

		vi.clearAllMocks();
	});

	it("should await our broadcast", () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		vi.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(0);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurFinalSignature");

		vi.clearAllMocks();
	});

	it("should await other signatures", () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOtherSignatures");

		vi.clearAllMocks();
	});

	it("should await confirmation", () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingConfirmation");

		vi.clearAllMocks();
	});

	it("should be multisignature ready", () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingOurFinalSignature");

		vi.clearAllMocks();
	});

	it("should await final signature", () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(false);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isAwaitingFinalSignature");

		vi.clearAllMocks();
	});

	it("should be able to broadcast only", () => {
		vi.spyOn(wallet, "address").mockReturnValue("1");
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		vi.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(0);
		vi.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(true);

		const { result } = renderHook(() => useMultiSignatureStatus({ transaction, wallet }));

		expect(result.current.status.value).toBe("isMultiSignatureReady");

		vi.clearAllMocks();
	});
});
