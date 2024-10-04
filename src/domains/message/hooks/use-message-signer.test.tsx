import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { useMessageSigner } from "./use-message-signer";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	mockNanoXTransport,
	triggerMessageSignOnce,
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
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		await env.profiles().restore(profile);
		await profile.sync();

		await triggerMessageSignOnce(wallet);
	});

	it("should sign message", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const signedMessage = await result.current.sign(wallet, "message", getDefaultWalletMnemonic());

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
			signature:
				"1b507279e46a1c4d6c97abca5a8f9ec03abd59164693dd2d81462bb9c2b4d23c6921c5ce940824bc3a1075ff87a6f2bffcd47c3b803dac6520e043b2dc21f0c7",
		});
	});

	it("should sign message with encrypted mnemonic", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletActsWithMnemonicWithEncryption = vi
			.spyOn(wallet, "actsWithMnemonicWithEncryption")
			.mockReturnValue(true);
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(getDefaultWalletMnemonic());

		const signedMessage = await result.current.sign(wallet, "message", undefined, "password", undefined);

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
			signature:
				"1b507279e46a1c4d6c97abca5a8f9ec03abd59164693dd2d81462bb9c2b4d23c6921c5ce940824bc3a1075ff87a6f2bffcd47c3b803dac6520e043b2dc21f0c7",
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
			signatory: "03a02b9d5fdd1307c2ee4652ba54d492d1fd11a7d1bb3f3a44c4a05e79f19de933",
			signature:
				"7f610893292f2c8b152c2c9fb8f84ea0a71a2fbc4abe4fbe3736011ae2ddef7f814f8b00549bcb41ef759fa8fc0fdf914b55d6bc5a207053887bf426ae19f08e",
		});

		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with encrypted secret", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletActsWithSecretWithEncryption = vi
			.spyOn(wallet, "actsWithSecretWithEncryption")
			.mockReturnValue(true);
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue("secret");

		const signedMessage = await result.current.sign(wallet, "message", undefined, "password", undefined);

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "03a02b9d5fdd1307c2ee4652ba54d492d1fd11a7d1bb3f3a44c4a05e79f19de933",
			signature:
				"7f610893292f2c8b152c2c9fb8f84ea0a71a2fbc4abe4fbe3736011ae2ddef7f814f8b00549bcb41ef759fa8fc0fdf914b55d6bc5a207053887bf426ae19f08e",
		});

		walletActsWithSecretWithEncryption.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with secret", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletActsWithSecret = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		const signedMessage = await result.current.sign(wallet, "message", undefined, undefined, "password");

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "02b568858a407a8721923b89df9963d30013639ac690cce5f555529b77b83cbfc7",
			signature:
				"3373c6c3ac0c72120804efac12dbe8e490edf47fe772ca66307dd0a352ef33844ffaab527c4cc4c1653ff901481863dff64ada35ecf34c15b0f0bbae960afbee",
		});

		walletActsWithSecret.mockRestore();
	});

	it("should sign message with encrypted wif", async () => {
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
			signatory: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
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
