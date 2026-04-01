import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WalletAliasProvider } from "./profile.wallet.alias";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from ".";

describe("WalletAliasProvider", () => {
	let profile: Contracts.IProfile;
	let provider: WalletAliasProvider;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		provider = new WalletAliasProvider(profile);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return alias from known wallets", () => {
		vi.spyOn(profile.knownWallets(), "is").mockReturnValue(true);
		vi.spyOn(profile.knownWallets(), "name").mockReturnValue("Known Wallet");

		const result = provider.findAliasByAddress("0x123");
		expect(result).toBe("Known Wallet");
	});

	it("should return alias from local wallet display name", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(profile.knownWallets(), "is").mockReturnValue(false);
		vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue(wallet);
		vi.spyOn(wallet, "displayName").mockReturnValue("My Wallet");

		const result = provider.findAliasByAddress(wallet.address());
		expect(result).toBeDefined();
	});

	it("should return undefined when validators() throws", () => {
		vi.spyOn(profile.knownWallets(), "is").mockReturnValue(false);
		vi.spyOn(profile.validators(), "all").mockImplementation(() => {
			throw new Error("Validators not available");
		});

		const result = provider.findAliasByAddress("0x123");
		expect(result).toBeUndefined();
	});

	it("should return alias from validator username", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(profile.knownWallets(), "is").mockReturnValue(false);
		vi.spyOn(profile.validators(), "all").mockReturnValue([
			{ address: () => wallet.address(), username: () => "test_delegate" },
		] as Contracts.IReadOnlyWallet[]);

		const result = provider.findAliasByAddress(wallet.address());
		expect(result).toBeDefined();
	});

	it("should return undefined alias when findAliasByAddress throws error", () => {
		vi.spyOn(profile.knownWallets(), "is").mockImplementation(() => {
			throw new Error("Unexpected error");
		});

		const result = provider.findAliasByAddress("0x123");
		expect(result).toBeUndefined();
	});

	it("should use network wallet names ordering when useNetworkWalletNames is true", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(profile.knownWallets(), "is").mockReturnValue(false);
		vi.spyOn(profile.appearance(), "get").mockReturnValue(true);
		vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue(wallet);
		vi.spyOn(wallet, "displayName").mockReturnValue("My Wallet");
		vi.spyOn(wallet, "username").mockReturnValue("my_username");

		const result = provider.findAliasByAddress(wallet.address());
		expect(result).toBeDefined();
	});

	it("should use default ordering when useNetworkWalletNames is false", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(profile.knownWallets(), "is").mockReturnValue(false);
		vi.spyOn(profile.appearance(), "get").mockReturnValue(false);
		vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue(wallet);
		vi.spyOn(wallet, "displayName").mockReturnValue("My Wallet");

		const result = provider.findAliasByAddress(wallet.address());
		expect(result).toBeDefined();
	});

	it("should generate default alias for non-ledger wallet", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);

		const result = provider.generateAlias(wallet);
		expect(result).toBe("Address #2");
	});

	it("should generate ledger alias for ledger wallet", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/0'/0/0");

		const result = provider.generateAlias(wallet);
		expect(result).toBe("Ledger #1");
	});
});
