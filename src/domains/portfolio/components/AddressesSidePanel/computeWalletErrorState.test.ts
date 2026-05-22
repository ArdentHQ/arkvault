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
				addressToDelete: "0x123",
				hdAccountToDelete: undefined,
				isManageMode: false,
				selectedAddressesLength: 1,
				wallet,
			}),
		).toBe(false);
	});

	it("returns false when selected addresses length is 0", () => {
		expect(
			computeWalletErrorState({
				addressToDelete: "0x123",
				hdAccountToDelete: undefined,
				isManageMode: true,
				selectedAddressesLength: 0,
				wallet,
			}),
		).toBe(false);
	});

	it("returns true when wallet address matches addressToDelete", () => {
		expect(
			computeWalletErrorState({
				addressToDelete: wallet.address(),
				hdAccountToDelete: undefined,
				isManageMode: true,
				selectedAddressesLength: 1,
				wallet,
			}),
		).toBe(true);
	});

	it("returns true when hdAccountToDelete matches wallet account name", () => {
		const accountName = "Test Wallet 1";
		const spy = vi.spyOn(wallet, "accountName").mockReturnValue(accountName);
		expect(
			computeWalletErrorState({
				addressToDelete: undefined,
				hdAccountToDelete: accountName,
				isManageMode: true,
				selectedAddressesLength: 1,
				wallet,
			}),
		).toBe(true);
		spy.mockRestore();
	});

	it("returns false when no conditions match", () => {
		expect(
			computeWalletErrorState({
				addressToDelete: "0x456",
				hdAccountToDelete: "Account 2",
				isManageMode: true,
				selectedAddressesLength: 1,
				wallet,
			}),
		).toBe(false);
	});
});
