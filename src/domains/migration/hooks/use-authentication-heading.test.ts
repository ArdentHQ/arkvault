import { renderHook } from "@testing-library/react-hooks";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";
import { useAuthenticationHeading } from "./use-authentication-heading";
import { env, getDefaultProfileId } from "@/utils/testing-library";

let wallet: IReadWriteWallet;

describe("useQRCode hook", () => {
	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should generate description for a wallet that uses mnemonic", () => {
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your mnemonic passphrase to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that is imported by address", () => {
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithAddress").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your mnemonic passphrase to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that is imported by public key", () => {
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithAddress").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithPublicKey").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your mnemonic passphrase to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that uses wif", () => {
		vi.spyOn(wallet, "actsWithWif").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your WIF to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that uses private key", () => {
		vi.spyOn(wallet, "actsWithPrivateKey").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your private key to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that uses secret", () => {
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your secret to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that uses mnemonic with encryption", () => {
		vi.spyOn(wallet, "actsWithMnemonicWithEncryption").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your encryption password to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that uses wif with encryption", () => {
		vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your encryption password to authenticate the migration transaction."',
		);
	});

	it("should generate description for a wallet that uses secret with encryption", () => {
		vi.spyOn(wallet, "actsWithSecretWithEncryption").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your encryption password to authenticate the migration transaction."',
		);
	});
});
