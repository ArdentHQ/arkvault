import {
	env,
	getDefaultMainsailWalletMnemonic,
	getMainsailProfileId,
	mockNanoXTransport,
	triggerMessageSignOnce,
} from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import { useMessageSigner } from "./use-message-signer";

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

	const signedMessageData = {
		message: "message",
		signatory: "021adbf4453accaefea33687c672fd690702246ef397363421585f134a1e68c175",
		signature:
			"0x86055a6663f1d7bc588ad1ed890f4121bb12aa8724f0d5cb9e44adc6b654a94612a951aea2b24ccea418f713e37addaa18e227bc1a2f9f9b4a6af2aea5ad7f351b",
	};

	const secretSignedMessageData = {
		message: "message",
		signatory: "03a02b9d5fdd1307c2ee4652ba54d492d1fd11a7d1bb3f3a44c4a05e79f19de933",
		signature:
			"0xd49eb6182cd84423200343fc0c32d4175dfac5540ba833c23e6cbac46e52d9fc401b9602c987e2fae4f918bf3a7d6e198a7871a030ccdb4b76e7f901043d82721b",
	};

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

		expect(signedMessage).toStrictEqual(signedMessageData);
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

		expect(signedMessage).toStrictEqual(signedMessageData);

		walletActsWithMnemonicWithEncryption.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with secret", async () => {
		const { result } = renderHook(() => useMessageSigner());

		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue("secret");

		const signedMessage = await result.current.sign(wallet, "message", undefined, undefined, "secret");

		expect(signedMessage).toStrictEqual(secretSignedMessageData);

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

		expect(signedMessage).toStrictEqual(secretSignedMessageData);

		walletActsWithSecretWithEncryption.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should sign message with ledger", async () => {
		const ledgerSignature = { "message": "test", "signatory": "0453a97a244e6323ef60430e9761be5a972228e533f31723d376397808b4be3b4658578da4e51ee8fe1ea076fb2341902247f80fd87ee1b15b1e85a05905912c3a", "signature": "0xf97c049d45fd18ffd96cba05aa36d73711e979ceecb7f220d89ca2f01b85f66a7f5bb80fddd8c691b456c8e8fa6248c08b17643149b86568ddb3dca8ad0fd7f11b" }
		const nanoXTransportMock = mockNanoXTransport();
		const { result } = renderHook(() => useMessageSigner());

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.ledger(), "getExtendedPublicKey").mockResolvedValue(ledgerSignature.signatory);
		vi.spyOn(wallet.ledger(), "signMessage").mockResolvedValue(ledgerSignature.signature);

		const signedMessage = await result.current.sign(wallet, ledgerSignature.message);

		expect(signedMessage).toStrictEqual(ledgerSignature);

		vi.clearAllMocks();
		nanoXTransportMock.mockRestore();
	});

	it.skip("should sign message with cold ledger wallet", async () => {
		const { result } = renderHook(() => useMessageSigner());

		vi.spyOn(wallet, "publicKey").mockReturnValue(undefined);
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);
		vi.spyOn(wallet.ledger(), "signMessage").mockResolvedValue("signature");

		const signedMessage = await result.current.sign(wallet, "message");

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
			signature: "signature",
		});

		vi.clearAllMocks();
	});

	it.skip("should abort sign with ledger", async () => {
		const abortCtrl = new AbortController();
		const abortSignal = abortCtrl.signal;

		const { result } = renderHook(() => useMessageSigner());

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.ledger(), "signMessage").mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve("signature"), 20_000)),
		);

		setTimeout(() => abortCtrl.abort(), 100);

		await expect(
			result.current.sign(wallet, "message", undefined, undefined, undefined, { abortSignal }),
		).rejects.toBe("ERR_ABORT");

		vi.clearAllMocks();
	});
});
