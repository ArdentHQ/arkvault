import { Contracts, DTO } from "@/app/lib/profiles";
import { act, env, getMainsailProfileId, renderHook } from "@/utils/testing-library";

import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { useUnconfirmedTransactions } from "./use-unconfirmed-transactions";

const signedTransactionData = {
	identifier: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
	serialized: "",
	signedData: {
		data: "36a94134000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000077364667364663300000000000000000000000000000000000000000000000000",
		from: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
		gasLimit: "1200000",
		gasPrice: "5000000000",
		hash: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
		nonce: "187",
		r: "c88273028bf96f212eee0d20dc0a72aff1d3670ac2f49a8bc648a15a4366631c",
		s: "7073c8d6d2530fdfeafd4ac4a72f0976f33284253e3b97de70b6779b70d7a2f3",
		senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
		to: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
		username: "sdfsdf3",
		v: 1,
		value: "0",
	},
};

const secondSignedTransactionHash = "e82068d4c535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f33";

const mockUnconfirmedTransactionData = {
	data: "0x36a94134000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000077364667364663300000000000000000000000000000000000000000000000000",
	from: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
	gasLimit: "1200000",
	gasPrice: "5000000000",
	hash: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
	nonce: "187",
	senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
	to: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
	value: "0",
};

const TEST_NETWORK_ID = "mainsail.devnet";

let wallet: Contracts.IReadWriteWallet;

const createMockTransaction = (
	wallet: Contracts.IReadWriteWallet,
	signedData = {},
): DTO.ExtendedSignedTransactionData => {
	const signedTransaction = new SignedTransactionData().configure(
		{ ...signedTransactionData.signedData, ...signedData },
		signedTransactionData.serialized,
	);

	return new ExtendedSignedTransactionData(signedTransaction, wallet);
};

const getFlatTransactions = (nested: any) => {
	const flatTransactions: any[] = [];
	for (const [networkId, wallets] of Object.entries(nested)) {
		for (const [walletAddress, transactions] of Object.entries(wallets as any)) {
			for (const transaction of transactions as any) {
				flatTransactions.push({
					networkId,
					transaction,
					walletAddress,
				});
			}
		}
	}
	return flatTransactions;
};

const countTransactions = (nested: any): number => {
	let count = 0;
	for (const wallets of Object.values(nested)) {
		for (const transactions of Object.values(wallets as any)) {
			count += (transactions as any).length;
		}
	}
	return count;
};

describe("useUnconfirmedTransactions", () => {
	beforeEach(async () => {
		wallet = env.profiles().findById(getMainsailProfileId()).wallets().first();
		await wallet.synchroniser().identity();

		localStorage.clear();
		vi.clearAllMocks();
	});

	it("should initialize with empty unconfirmed transactions", () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		expect(result.current.unconfirmedTransactions).toEqual({});
		expect(typeof result.current.addUnconfirmedTransactionFromSigned).toBe("function");
		expect(typeof result.current.removeUnconfirmedTransaction).toBe("function");
	});

	it("should add an unconfirmed transaction", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction = createMockTransaction(wallet);

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);

		const walletAddress = wallet.address();

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID]).toBeDefined();
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress]).toBeDefined();
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress]).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress][0]).toEqual(
			signedTransactionData,
		);
	});

	it("should add multiple unconfirmed transactions", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction1 = createMockTransaction(wallet);
		const mockTransaction2 = createMockTransaction(wallet, {
			hash: secondSignedTransactionHash,
		});

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction1);
		});

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction2);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(2);

		const walletAddress = wallet.address();
		const transactions = result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress];

		expect(transactions).toHaveLength(2);
		expect(transactions[0].signedData.hash).toBe(signedTransactionData.signedData.hash);
		expect(transactions[1].signedData.hash).toBe(secondSignedTransactionHash);
	});

	it("should replace duplicate transaction when adding with same hash", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction = createMockTransaction(wallet);

		// Add the same transaction twice
		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		// Should only have one transaction (duplicate replaced)
		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);

		const walletAddress = wallet.address();
		const transactions = result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress];

		expect(transactions).toHaveLength(1);
		expect(transactions[0].signedData.hash).toBe(signedTransactionData.signedData.hash);
	});

	it("should remove an unconfirmed transaction by hash", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction1 = createMockTransaction(wallet);
		const mockTransaction2 = createMockTransaction(wallet, {
			hash: secondSignedTransactionHash,
		});

		// Add two transactions
		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction1);
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction2);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(2);

		// Remove the first transaction
		act(() => {
			result.current.removeUnconfirmedTransaction(signedTransactionData.signedData.hash);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);

		const walletAddress = wallet.address();
		const transactions = result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress];

		expect(transactions).toHaveLength(1);
		expect(transactions[0].signedData.hash).toBe(secondSignedTransactionHash);
	});

	it("should not change unconfirmed transactions when removing non-existent hash", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction = createMockTransaction(wallet);

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);

		// Try to remove non-existent transaction
		act(() => {
			result.current.removeUnconfirmedTransaction("non-existent-hash");
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);

		const walletAddress = wallet.address();
		const transactions = result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress];

		expect(transactions[0].signedData.hash).toBe(signedTransactionData.signedData.hash);
	});

	it("should handle error when adding transaction fails", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction = {
			data: () => {
				throw new Error("Transaction data error");
			},
			hash: () => "test-hash",
			wallet: () => ({
				address: () => "test-address",
			}),
		} as unknown as DTO.ExtendedSignedTransactionData;

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		// Should not add the transaction and should remain empty
		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(0);
	});

	it("should add an unconfirmed transaction from API data", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const walletAddress = "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10";

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(
				TEST_NETWORK_ID,
				walletAddress,
				mockUnconfirmedTransactionData,
			);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);

		const transactions = result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress];
		expect(transactions).toHaveLength(1);
		expect(transactions[0]).toEqual({
			signedData: mockUnconfirmedTransactionData,
		});
	});

	it("should replace duplicate unconfirmed transaction when adding with same hash", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const walletAddress = "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10";

		const firstTransaction = {
			...mockUnconfirmedTransactionData,
			value: "100",
		};

		const duplicateTransaction = {
			...mockUnconfirmedTransactionData,
			value: "200",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddress, firstTransaction);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress][0].signedData.value).toBe("100");

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddress, duplicateTransaction);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(1);
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress][0].signedData.value).toBe("200");
	});

	it("should add multiple unconfirmed transactions with different hashes", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const walletAddress = "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10";

		const transaction1 = mockUnconfirmedTransactionData;
		const transaction2 = {
			...mockUnconfirmedTransactionData,
			hash: "different-hash-123",
			nonce: "188",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddress, transaction1);
		});

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddress, transaction2);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(2);

		const transactions = result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress];
		expect(transactions).toHaveLength(2);
		expect(transactions[0].signedData.hash).toBe(mockUnconfirmedTransactionData.hash);
		expect(transactions[1].signedData.hash).toBe("different-hash-123");
	});

	it("cleanupUnconfirmedForAddresses keeps only remote hashes for scoped addresses and leaves others untouched", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const addressA = wallet.address();
		const addressB = "ADDRESS_B";

		const transaction1 = {
			...mockUnconfirmedTransactionData,
			hash: "hash-a1",
			nonce: "190",
		};
		const transaction2 = {
			...mockUnconfirmedTransactionData,
			hash: "hash-a2",
			nonce: "191",
		};
		const transaction3 = {
			...mockUnconfirmedTransactionData,
			hash: "hash-b1",
			nonce: "192",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, addressA, transaction1);
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, addressA, transaction2);
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, addressB, transaction3);
		});

		expect(countTransactions(result.current.unconfirmedTransactions)).toBe(3);

		act(() => {
			result.current.cleanupUnconfirmedForAddresses([addressA], ["hash-a2"]);
		});

		const flatTransactions = getFlatTransactions(result.current.unconfirmedTransactions);
		const hashes = flatTransactions.map((u) => u.transaction.signedData.hash);

		expect(hashes).toEqual(expect.arrayContaining(["hash-a2", "hash-b1"]));
		expect(hashes).not.toContain("hash-a1");

		const remainingForB = flatTransactions.filter((u) => u.walletAddress === addressB);
		expect(remainingForB).toHaveLength(1);
		expect(remainingForB[0].transaction.signedData.hash).toBe("hash-b1");
	});

	it("should delete empty network when removing last wallet", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const walletAddress = wallet.address();
		const mockTransaction = createMockTransaction(wallet);

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID]).toBeDefined();
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddress]).toBeDefined();

		act(() => {
			result.current.removeUnconfirmedTransaction(signedTransactionData.signedData.hash);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID]).toBeUndefined();
	});

	it("should delete empty wallet address during cleanup but keep network with other wallets", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const walletAddressA = wallet.address();
		const walletAddressB = "OTHER_WALLET_ADDRESS";

		const transactionA = {
			...mockUnconfirmedTransactionData,
			hash: "hash-a1",
		};
		const transactionB = {
			...mockUnconfirmedTransactionData,
			hash: "hash-b1",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddressA, transactionA);
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddressB, transactionB);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddressA]).toBeDefined();
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddressB]).toBeDefined();

		act(() => {
			result.current.cleanupUnconfirmedForAddresses([walletAddressA], []);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID]).toBeDefined();
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddressA]).toBeUndefined();
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddressB]).toBeDefined();
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddressB]).toHaveLength(1);
	});

	it("should delete empty network during cleanup when all wallets are cleaned up", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const walletAddressA = wallet.address();
		const walletAddressB = "OTHER_WALLET_ADDRESS";

		const transactionA = {
			...mockUnconfirmedTransactionData,
			hash: "hash-a1",
		};
		const transactionB = {
			...mockUnconfirmedTransactionData,
			hash: "hash-b1",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddressA, transactionA);
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddressB, transactionB);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID]).toBeDefined();
		expect(Object.keys(result.current.unconfirmedTransactions[TEST_NETWORK_ID])).toHaveLength(2);

		act(() => {
			result.current.cleanupUnconfirmedForAddresses([walletAddressA, walletAddressB], []);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID]).toBeUndefined();
		expect(Object.keys(result.current.unconfirmedTransactions)).toHaveLength(0);
	});

	it("should preserve network structure when removing transactions across multiple networks", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const networkIdA = TEST_NETWORK_ID;
		const networkIdB = "mainsail.testnet";
		const walletAddress = wallet.address();

		const transactionA = {
			...mockUnconfirmedTransactionData,
			hash: "hash-a1",
		};
		const transactionB = {
			...mockUnconfirmedTransactionData,
			hash: "hash-b1",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(networkIdA, walletAddress, transactionA);
			result.current.addUnconfirmedTransactionFromApi(networkIdB, walletAddress, transactionB);
		});

		expect(result.current.unconfirmedTransactions[networkIdA]).toBeDefined();
		expect(result.current.unconfirmedTransactions[networkIdB]).toBeDefined();

		act(() => {
			result.current.removeUnconfirmedTransaction("hash-a1");
		});

		expect(result.current.unconfirmedTransactions[networkIdA]).toBeUndefined();
		expect(result.current.unconfirmedTransactions[networkIdB]).toBeDefined();
		expect(result.current.unconfirmedTransactions[networkIdB][walletAddress]).toHaveLength(1);
	});

	it("should handle removeUnconfirmedTransaction when transaction exists in multiple wallets", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const walletAddressA = wallet.address();
		const walletAddressB = "OTHER_WALLET_ADDRESS";
		const sharedHash = "shared-hash-123";

		const transactionA = {
			...mockUnconfirmedTransactionData,
			hash: sharedHash,
		};
		const transactionB = {
			...mockUnconfirmedTransactionData,
			hash: sharedHash,
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddressA, transactionA);
			result.current.addUnconfirmedTransactionFromApi(TEST_NETWORK_ID, walletAddressB, transactionB);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddressA]).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID][walletAddressB]).toHaveLength(1);

		act(() => {
			result.current.removeUnconfirmedTransaction(sharedHash);
		});

		expect(result.current.unconfirmedTransactions[TEST_NETWORK_ID]).toBeUndefined();
	});
});
