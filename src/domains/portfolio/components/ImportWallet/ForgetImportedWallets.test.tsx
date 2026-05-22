import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { forgetImportedWallets } from "./ImportAddressSidePanel.blocks";
import { Contracts } from "@/app/lib/profiles";

vi.mock("@/utils/assertions", () => ({
	assertWallet: vi.fn(),
	assertString: vi.fn(),
}));

describe("forgetImportedWallets", () => {
	let mockProfile: Partial<Contracts.IProfile>;
	let mockWallets: Partial<Contracts.IWalletCollection>;
	let mockSelectedWallets: Partial<Contracts.IReadWriteWallet[]>;
	let mockFirstWallet: Partial<Contracts.IReadWriteWallet>;

	beforeEach(() => {
		mockFirstWallet = {
			id: vi.fn(() => "first-wallet"),
			address: vi.fn(() => "0x123"),
		};

		mockSelectedWallets = [];

		mockWallets = {
			values: vi.fn(() => []),
			forget: vi.fn(),
			selectOne: vi.fn(),
			selected: vi.fn(() => mockSelectedWallets),
			first: vi.fn(() => mockFirstWallet),
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
			id: vi.fn(() => "imported-wallet"),
			address: vi.fn(() => "0x123"),
		};

		vi.mocked(mockWallets.values).mockReturnValue([importedWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.forget).toHaveBeenCalledWith("imported-wallet");
	});

	it("should select the first wallet when no wallets are selected after forgetting", () => {
		const importedWallet = {
			id: vi.fn(() => "imported-wallet"),
			address: vi.fn(() => "0x123"),
		};

		vi.mocked(mockWallets.values).mockReturnValue([importedWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.selectOne).toHaveBeenCalledWith(mockFirstWallet);
	});

	it("should not select the first wallet when other wallets remain selected", () => {
		const otherWallet = { id: vi.fn(() => "other-wallet"), address: vi.fn(() => "0x456") };
		mockSelectedWallets.push(otherWallet);

		const importedWallet = {
			id: vi.fn(() => "imported-wallet"),
			address: vi.fn(() => "0x123"),
		};

		vi.mocked(mockWallets.values).mockReturnValue([importedWallet, otherWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.selectOne).not.toHaveBeenCalled();
	});

	it("should not forget wallet if address does not match", () => {
		const importedWallet = {
			id: vi.fn(() => "imported-wallet"),
			address: vi.fn(() => "0x123"),
		};

		const otherWallet = { id: vi.fn(() => "other-wallet"), address: vi.fn(() => "0x456") };

		vi.mocked(mockWallets.values).mockReturnValue([otherWallet]);

		forgetImportedWallets(mockProfile, importedWallet);

		expect(mockWallets.forget).not.toHaveBeenCalled();
	});
});
