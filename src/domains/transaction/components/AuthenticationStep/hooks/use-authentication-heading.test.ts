import { renderHook } from "@testing-library/react-hooks";
import { useAuthenticationHeading } from "./use-authentication-heading";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";
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

	it("should generate description for a wallet that uses mnemonic", async () => {
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your mnemonic passphrase to authenticate the transaction."',
		);
	});

	it("should generate description for a wallet that is imported by using address only", async () => {
		vi.spyOn(wallet, "actsWithAddress").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your mnemonic passphrase to authenticate the transaction."',
		);
	});

	it("should generate description for a wallet that uses wif", async () => {
		vi.spyOn(wallet, "actsWithWif").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot('"Enter your WIF to authenticate the transaction."');
	});

	it("should generate description for a wallet that uses private key", async () => {
		vi.spyOn(wallet, "actsWithPrivateKey").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your private key to authenticate the transaction."',
		);
	});

	it("should generate description for a wallet that uses secret", async () => {
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your secret to authenticate the transaction."',
		);
	});

	it("should generate description for a wallet that uses mnemonic with encryption", async () => {
		vi.spyOn(wallet, "actsWithMnemonicWithEncryption").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your encryption password to authenticate the transaction."',
		);
	});

	it("should generate description for a wallet that uses wif with encryption", async () => {
		vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your encryption password to authenticate the transaction."',
		);
	});

	it("should generate description for a wallet that uses secret with encryption", async () => {
		vi.spyOn(wallet, "actsWithSecretWithEncryption").mockReturnValue(true);

		const { result } = renderHook(() => useAuthenticationHeading({ wallet }));

		expect(result.current.description).toMatchInlineSnapshot(
			'"Enter your encryption password to authenticate the transaction."',
		);
	});
});
