import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { forgetImportedWallets } from "./ImportAddressSidePanel.blocks";
import { Contracts } from "@/app/lib/profiles";

vi.mock("@/utils/assertions", () => ({
	assertString: vi.fn(),
	assertWallet: vi.fn(),
}));

describe("forgetImportedWallets", () => {
	const testAddress = "0x123";
	const importedWalletId = importedWalletId;

	let mockProfile: Partial<Contracts.IProfile>;
	let mockWallets: Partial<Contracts.IWalletCollection>;
	let mockSelectedWallets: Partial<Contracts.IReadWriteWallet[]>;
	let mockFirstWallet: Partial<Contracts.IReadWriteWallet>;

	beforeEach(() => {
		mockFirstWallet = {
			address: vi.fn(() => testAddress),
			id: vi.fn(() => "first-wallet"),
		};

		mockSelectedWallets = [];

		mockWallets = {
			first: vi.fn(() => mockFirstWallet),
			forget: vi.fn(),
			selectOne: vi.fn(),
			selected: vi.fn(() => mockSelectedWallets),
			values: vi.fn(() => []),
		};

		mockProfile = {
			activeNetwork: vi.fn(),
			wallets: vi.fn(() => mockWallets),
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should forget the imported wallet if it matches", () => {
		const importedWallet = {
			address: vi.fn(() => testAddress),
			id: vi.fn(() => importedWalletId),
		};

		vi.mocked(mockWallets.values).mockReturnValue([importedWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.forget).toHaveBeenCalledWith(importedWalletId);
	});

	it("should select the first wallet when no wallets are selected after forgetting", () => {
		const importedWallet = {
			address: vi.fn(() => testAddress),
			id: vi.fn(() => importedWalletId),
		};

		vi.mocked(mockWallets.values).mockReturnValue([importedWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.selectOne).toHaveBeenCalledWith(mockFirstWallet);
	});

	it("should not select the first wallet when other wallets remain selected", () => {
		const otherWallet = { address: vi.fn(() => "0x456"), id: vi.fn(() => "other-wallet") };
		mockSelectedWallets.push(otherWallet);

		const importedWallet = {
			address: vi.fn(() => "0x123"),
			id: vi.fn(() => importedWalletId),
		};

		vi.mocked(mockWallets.values).mockReturnValue([importedWallet, otherWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.selectOne).not.toHaveBeenCalled();
	});

	it("should not forget wallet if address does not match", () => {
		const importedWallet = {
			address: vi.fn(() => "0x123"),
			id: vi.fn(() => importedWalletId),
		};

		const otherWallet = { address: vi.fn(() => "0x456"), id: vi.fn(() => "other-wallet") };

		vi.mocked(mockWallets.values).mockReturnValue([otherWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.forget).not.toHaveBeenCalled();
	});
});
