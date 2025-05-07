import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";

import { useMessageSigner } from "./use-message-signer";
import {
	env,
	getMainsailProfileId,
	mockNanoXTransport,
	triggerMessageSignOnce,
	getDefaultMainsailWalletMnemonic,
} from "@/utils/testing-library";

// Mock implementation of TextEncoder to always return Uint8Array.
vi.stubGlobal(
	"TextEncoder",
	class MockTextEncoder {
		encode(text: string) {
			return new Uint8Array([...text].map((character) => character.codePointAt(0)));
		}
	},
);

describe("Use Message Signer Hook", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();
		await env.profiles().restore(profile);
		await profile.sync();

		await triggerMessageSignOnce(wallet);
	});

	it("should sign message", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const signedMessage = await result.current.sign(wallet, "message", getDefaultMainsailWalletMnemonic());

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "03e1149b7af2e815edd221febb0e3037671b7a2b78668e191f79ad9366cb1751b6",
			signature:
				"f96fee98d4cbdbd5139f12488c3440f780d7f41cb86f38730971e6b7d2eef20024e6e352a6d7de5b3f3bd91ce8b1fcf10277aa81e56b61805d39c3af8f9659191b",
		});
	});

	it("should throw exception if no credentials are provided", async () => {
		const { result } = renderHook(() => useMessageSigner());

		let isErrored = false;
		try {
			await result.current.sign(wallet, "message");
		} catch {
			isErrored = true;
		}

		expect(isErrored).toBe(true);
	});

	it("should sign message with encrypted mnemonic", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletActsWithMnemonicWithEncryption = vi
			.spyOn(wallet, "actsWithMnemonicWithEncryption")
			.mockReturnValue(true);
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(getDefaultMainsailWalletMnemonic());

		const signedMessage = await result.current.sign(wallet, "message", undefined, "password", undefined);

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "03e1149b7af2e815edd221febb0e3037671b7a2b78668e191f79ad9366cb1751b6",
			signature:
				"f96fee98d4cbdbd5139f12488c3440f780d7f41cb86f38730971e6b7d2eef20024e6e352a6d7de5b3f3bd91ce8b1fcf10277aa81e56b61805d39c3af8f9659191b",
		});

		walletActsWithMnemonicWithEncryption.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with secret", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue("secret");

		const signedMessage = await result.current.sign(wallet, "message", undefined, undefined, "secret");

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "036274d52bf3b9496b1cd5f3eefde5aafedf2079cadff2bdf8668356b72f09ebc4",
			signature:
				"8fbfff6598c7e49792b3c626b0af3a27a33b648d1bebbc4c7683b126a4b76b590a4a400b6dbd6fb52869a970312f40d38dff2ce21920bcf2176e552b66951f021c",
		});

		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with encrypted secret with encryption", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletActsWithSecretWithEncryption = vi
			.spyOn(wallet, "actsWithSecretWithEncryption")
			.mockReturnValue(true);
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue("secret");

		const signedMessage = await result.current.sign(wallet, "message", undefined, "password", undefined);

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "036274d52bf3b9496b1cd5f3eefde5aafedf2079cadff2bdf8668356b72f09ebc4",
			signature:
				"8fbfff6598c7e49792b3c626b0af3a27a33b648d1bebbc4c7683b126a4b76b590a4a400b6dbd6fb52869a970312f40d38dff2ce21920bcf2176e552b66951f021c",
		});

		walletActsWithSecretWithEncryption.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with secret - 2", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletActsWithSecret = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		const signedMessage = await result.current.sign(wallet, "message", undefined, undefined, "password");

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "0302ea3440907269312bce7018f19df2c7be2811c5dbd0fe82cca4c0f1f83addc1",
			signature: "c0e83da207c5f198210a211bdc250e3b3fd6db403baecc380605e82de5eacee926a2d4bbff06c3e26b65972fa5e243a20d22d55b7367f9ed5c4a63479c4a9d531b",
		});

		walletActsWithSecret.mockRestore();
	});

	it.skip("should sign message with encrypted wif", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const wifDto = await wallet.wifService().fromSecret("secret");

		const walletActsWithWifWithEncryption = vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(wifDto.wif);

		const signedMessage = await result.current.sign(wallet, "message", undefined, "password", undefined);

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "03a02b9d5fdd1307c2ee4652ba54d492d1fd11a7d1bb3f3a44c4a05e79f19de933",
			signature:
				"7f610893292f2c8b152c2c9fb8f84ea0a71a2fbc4abe4fbe3736011ae2ddef7f814f8b00549bcb41ef759fa8fc0fdf914b55d6bc5a207053887bf426ae19f08e",
		});

		walletActsWithWifWithEncryption.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with ledger", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { result } = renderHook(() => useMessageSigner());

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.coin().ledger(), "signMessage").mockResolvedValue("signature");

		const signedMessage = await result.current.sign(wallet, "message");

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "021adbf4453accaefea33687c672fd690702246ef397363421585f134a1e68c175",
			signature: "signature",
		});

		vi.clearAllMocks();
		nanoXTransportMock.mockRestore();
	});

	it("should sign message with cold ledger wallet", async () => {
		const { result } = renderHook(() => useMessageSigner());

		vi.spyOn(wallet, "publicKey").mockReturnValue(undefined);
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);
		vi.spyOn(wallet.coin().ledger(), "signMessage").mockResolvedValue("signature");

		const signedMessage = await result.current.sign(wallet, "message");

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
			signature: "signature",
		});

		vi.clearAllMocks();
	});

	it("should abort sign with ledger", async () => {
		const abortCtrl = new AbortController();
		const abortSignal = abortCtrl.signal;

		const { result } = renderHook(() => useMessageSigner());

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.coin().ledger(), "signMessage").mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve("signature"), 20_000)),
		);

		setTimeout(() => abortCtrl.abort(), 100);

		await expect(
			result.current.sign(wallet, "message", undefined, undefined, undefined, { abortSignal }),
		).rejects.toBe("ERR_ABORT");

		vi.clearAllMocks();
	});
});
