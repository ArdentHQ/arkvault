import { ReadOnlyWallet, ROWallet } from "./read-only-wallet";
import { describe, it } from "vitest";

describe('ReadOnlyWallet', () => {
	const mockWalletData: ROWallet = {
		address: '0x659A76be283644AEc2003aa8ba26485047fd1BFB',
		explorerLink: 'https://dwallets-evm.mainsailhq.com/wallet/0x659A76be283644AEc2003aa8ba26485047fd1BFB',
		governanceIdentifier: 'publicKey',
		isResignedValidator: false,
		isValidator: true,
		publicKey: '02f65cbd5dfe4979b559e00c089058fa7379554ba6d2558520f2036d8854f1c9a2',
		rank: 1,
		username: 'test_user',
	};

	const mockWalletDataWithAddressGovernance: ROWallet = {
		...mockWalletData,
		governanceIdentifier: 'address',
	};

	const mockWalletDataWithoutOptionalFields: ROWallet = {
		...mockWalletData,
		isResignedValidator: true,
		isValidator: false,
		publicKey: undefined,
		rank: undefined,
		username: undefined,
	};


	it('should return the correct address', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.address()).toBe(mockWalletData.address);
	});

	it('should return the correct public key', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.publicKey()).toBe(mockWalletData.publicKey);
	});

	it('should return undefined for public key if not provided', () => {
		const wallet = new ReadOnlyWallet(mockWalletDataWithoutOptionalFields);
		expect(wallet.publicKey()).toBeUndefined();
	});

	it('should return the correct username', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.username()).toBe(mockWalletData.username);
	});

	it('should return undefined for username if not provided', () => {
		const wallet = new ReadOnlyWallet(mockWalletDataWithoutOptionalFields);
		expect(wallet.username()).toBeUndefined();
	});

	it('should return the correct rank', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.rank()).toBe(mockWalletData.rank);
	});

	it('should return undefined for rank if not provided', () => {
		const wallet = new ReadOnlyWallet(mockWalletDataWithoutOptionalFields);
		expect(wallet.rank()).toBeUndefined();
	});

	it('should return the correct avatar', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#4381C0"/></svg>`;
		expect(wallet.avatar()).toBe(avatar);
	});

	it('should return the correct explorer link', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.explorerLink()).toBe(mockWalletData.explorerLink);
	});

	it('should return the correct validator status', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.isValidator()).toBe(mockWalletData.isValidator);
	});

	it('should return the correct resigned validator status', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.isResignedValidator()).toBe(mockWalletData.isResignedValidator);

		const walletResigned = new ReadOnlyWallet(mockWalletDataWithoutOptionalFields);
		expect(walletResigned.isResignedValidator()).toBe(mockWalletDataWithoutOptionalFields.isResignedValidator);
	});

	it('should return public key as governance identifier when governanceIdentifier is "publicKey"', () => {
		const wallet = new ReadOnlyWallet(mockWalletData);
		expect(wallet.governanceIdentifier()).toBe(mockWalletData.publicKey);
	});

	it('should return address as governance identifier when governanceIdentifier is "address"', () => {
		const wallet = new ReadOnlyWallet(mockWalletDataWithAddressGovernance);
		expect(wallet.governanceIdentifier()).toBe(mockWalletDataWithAddressGovernance.address);
	});
});
