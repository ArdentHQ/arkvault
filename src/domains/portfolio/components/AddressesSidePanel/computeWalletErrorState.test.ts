import { computeWalletErrorState } from "./AddressesSidePanel";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";

describe("computeWalletErrorState", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first() as Contracts.IReadWriteWallet;
	});

	it("returns false when not in manage mode", () => {
		expect(
			computeWalletErrorState({
				isManageMode: false,
				selectedAddressesLength: 1,
				addressToDelete: "0x123",
				hdAccountToDelete: undefined,
				wallet,
			}),
		).toBe(false);
	});

	it("returns false when selected addresses length is 0", () => {
		expect(
			computeWalletErrorState({
				isManageMode: true,
				selectedAddressesLength: 0,
				addressToDelete: "0x123",
				hdAccountToDelete: undefined,
				wallet,
			}),
		).toBe(false);
	});

	it("returns true when wallet address matches addressToDelete", () => {
		expect(
			computeWalletErrorState({
				isManageMode: true,
				selectedAddressesLength: 1,
				addressToDelete: wallet.address(),
				hdAccountToDelete: undefined,
				wallet,
			}),
		).toBe(true);
	});

	it("returns true when hdAccountToDelete matches wallet account name", () => {
		const accountName = "Test Wallet 1";
		const spy = vi.spyOn(wallet, "accountName").mockReturnValue(accountName);
		expect(
			computeWalletErrorState({
				isManageMode: true,
				selectedAddressesLength: 1,
				addressToDelete: undefined,
				hdAccountToDelete: accountName,
				wallet,
			}),
		).toBe(true);
		spy.mockRestore();
	});

	it("returns false when no conditions match", () => {
		expect(
			computeWalletErrorState({
				isManageMode: true,
				selectedAddressesLength: 1,
				addressToDelete: "0x456",
				hdAccountToDelete: "Account 2",
				wallet,
			}),
		).toBe(false);
	});
});
