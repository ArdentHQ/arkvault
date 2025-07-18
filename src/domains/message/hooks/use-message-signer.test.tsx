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
			"c1d378bf5ada11ee213a93e96a3faefafb2ca61e59492981844da9d9c371126624f5c31c38300c318182e9d33d0aef1e4bd952398403af8864e87d9833b8aa1501",
	};

	const secretSignedMessageData = {
		message: "message",
		signatory: "03a02b9d5fdd1307c2ee4652ba54d492d1fd11a7d1bb3f3a44c4a05e79f19de933",
		signature:
			"50e0c064787b4bb20efeb2c38d1d8c81f8aea07b0fe4fe3814ec02a176e6fe98095924e34777554b649d9265142e934054cd491de0e333155b4349b2e4b055c901",
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

	// @TODO: Implement message signing with mainsail
	// Task: https://app.clickup.com/t/86dwq94f5
	it.skip("should sign message with ledger", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { result } = renderHook(() => useMessageSigner());

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.ledger(), "sign").mockResolvedValue("signature");

		const signedMessage = await result.current.sign(wallet, "message");

		expect(signedMessage).toStrictEqual({
			message: "message",
			signatory: "021adbf4453accaefea33687c672fd690702246ef397363421585f134a1e68c175",
			signature: "signature",
		});

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
