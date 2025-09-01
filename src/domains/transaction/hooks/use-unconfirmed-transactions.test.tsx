import { act, env, getMainsailProfileId, renderHook } from "@/utils/testing-library";
import { Contracts, DTO } from "@/app/lib/profiles";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { useUnconfirmedTransactions } from "./use-unconfirmed-transactions";

const signedTransactionData = {
	identifier: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
	serialized: "",
	signedData: {
		data: "36a94134000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000077364667364663300000000000000000000000000000000000000000000000000",
		from: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
		gasLimit: "21592",
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

const mockUnconfirmedTransaction = {
	data: "0x36a94134000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000077364667364663300000000000000000000000000000000000000000000000000",
	from: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
	gas: "21592",
	gasPrice: "5000000000",
	hash: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
	networkId: "mainsail.devnet",
	nonce: "187",
	senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
	to: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
	value: "0",
	walletAddress: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
};

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

describe("useUnconfirmedTransactions", () => {
	beforeEach(async () => {
		wallet = env.profiles().findById(getMainsailProfileId()).wallets().first();
		await wallet.synchroniser().identity();

		// Clear localStorage to prevent test interference
		localStorage.clear();
		vi.clearAllMocks();
	});

	it("should initialize with empty unconfirmed transactions", () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		expect(result.current.unconfirmedTransactions).toEqual([]);
		expect(typeof result.current.addUnconfirmedTransaction).toBe("function");
		expect(typeof result.current.removeUnconfirmedTransaction).toBe("function");
	});

	it("should add a unconfirmed transaction", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction = createMockTransaction(wallet);

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0]).toEqual({
			networkId: "mainsail.devnet",
			transaction: signedTransactionData,
			walletAddress: wallet.address(),
		});
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

		expect(result.current.unconfirmedTransactions).toHaveLength(2);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.hash).toBe(
			signedTransactionData.signedData.hash,
		);
		expect(result.current.unconfirmedTransactions[1].transaction.signedData.hash).toBe(secondSignedTransactionHash);
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
		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.hash).toBe(
			signedTransactionData.signedData.hash,
		);
	});

	it("should remove a unconfirmed transaction by hash", async () => {
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

		expect(result.current.unconfirmedTransactions).toHaveLength(2);

		// Remove the first transaction
		act(() => {
			result.current.removeUnconfirmedTransaction(signedTransactionData.signedData.hash);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.hash).toBe(secondSignedTransactionHash);
	});

	it("should not change unconfirmed transactions when removing non-existent hash", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockTransaction = createMockTransaction(wallet);

		act(() => {
			result.current.addUnconfirmedTransactionFromSigned(mockTransaction);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);

		// Try to remove non-existent transaction
		act(() => {
			result.current.removeUnconfirmedTransaction("non-existent-hash");
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.hash).toBe(
			signedTransactionData.signedData.hash,
		);
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
		expect(result.current.unconfirmedTransactions).toHaveLength(0);
	});

	it("should add a unconfirmed transaction from unconfirmed transaction with gas property", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(mockUnconfirmedTransaction);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0]).toEqual({
			networkId: "mainsail.devnet",
			transaction: {
				serialized: "",
				signedData: {
					data: mockUnconfirmedTransaction.data,
					from: mockUnconfirmedTransaction.from,
					gasLimit: Number(mockUnconfirmedTransaction.gas),
					gasPrice: mockUnconfirmedTransaction.gasPrice,
					hash: mockUnconfirmedTransaction.hash,
					nonce: expect.any(Object), // BigNumber instance
					senderPublicKey: mockUnconfirmedTransaction.senderPublicKey,
					to: mockUnconfirmedTransaction.to,
					value: mockUnconfirmedTransaction.value,
				},
			},
			walletAddress: mockUnconfirmedTransaction.walletAddress,
		});
	});

	it("should add a unconfirmed transaction from unconfirmed transaction with gasLimit property", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockWithGasLimit = {
			...mockUnconfirmedTransaction,
			gasLimit: "25000",
			hash: "different-hash-with-gaslimit",
		};
		delete (mockWithGasLimit as any).gas;

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(mockWithGasLimit);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.gasLimit).toBe(25000);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.hash).toBe("different-hash-with-gaslimit");
	});

	it("should prioritize gasLimit over gas when both are present", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockWithBoth = {
			...mockUnconfirmedTransaction,
			gas: "21592",
			gasLimit: "30000",
			hash: "hash-with-both-gas-properties",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(mockWithBoth);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.gasLimit).toBe(30000);
	});

	it("should handle missing gas and gasLimit properties by defaulting to 0", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const mockWithoutGas = {
			...mockUnconfirmedTransaction,
			hash: "hash-without-gas",
		};
		delete (mockWithoutGas as any).gas;

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(mockWithoutGas);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.gasLimit).toBe(0);
	});

	it("should replace duplicate unconfirmed transaction when adding with same hash", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const firstTransaction = {
			...mockUnconfirmedTransaction,
			value: "100",
		};

		const duplicateTransaction = {
			...mockUnconfirmedTransaction,
			value: "200",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(firstTransaction);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.value).toBe("100");

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(duplicateTransaction);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(1);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.value).toBe("200");
	});

	it("should add multiple unconfirmed transactions with different hashes", async () => {
		const { result } = renderHook(() => useUnconfirmedTransactions());

		const transaction1 = mockUnconfirmedTransaction;
		const transaction2 = {
			...mockUnconfirmedTransaction,
			hash: "different-hash-123",
			nonce: "188",
		};

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(transaction1);
		});

		act(() => {
			result.current.addUnconfirmedTransactionFromUnconfirmed(transaction2);
		});

		expect(result.current.unconfirmedTransactions).toHaveLength(2);
		expect(result.current.unconfirmedTransactions[0].transaction.signedData.hash).toBe(mockUnconfirmedTransaction.hash);
		expect(result.current.unconfirmedTransactions[1].transaction.signedData.hash).toBe("different-hash-123");
	});
});
