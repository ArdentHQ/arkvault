import { act, env, getMainsailProfileId, renderHook } from "@/utils/testing-library";
import { Contracts, DTO } from "@/app/lib/profiles";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { usePendingTransactions } from "./use-pending-transactions";

const signedTransactionData = {
	"identifier": "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
	"serialized": "",
	"signedData": {
		"data": "36a94134000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000077364667364663300000000000000000000000000000000000000000000000000",
		"from": "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
		"gasLimit": "21592",
		"gasPrice": "5000000000",
		"hash": "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
		"nonce": "187",
		"r": "c88273028bf96f212eee0d20dc0a72aff1d3670ac2f49a8bc648a15a4366631c",
		"senderPublicKey": "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
		"s": "7073c8d6d2530fdfeafd4ac4a72f0976f33284253e3b97de70b6779b70d7a2f3",
		"value": "0",
		"to": "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
		"username": "sdfsdf3",
		"v": 1
	}
};

const secondSignedTransactionHash = "e82068d4c535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f33";

let wallet: Contracts.IReadWriteWallet;

const createMockTransaction = (wallet: Contracts.IReadWriteWallet, signedData = {}): DTO.ExtendedSignedTransactionData => {
	const signedTransaction = new SignedTransactionData().configure(
		{ ...signedTransactionData.signedData, ...signedData },
		signedTransactionData.serialized
	);

	return new ExtendedSignedTransactionData(signedTransaction, wallet);
};

describe("usePendingTransactions", () => {
	beforeEach(async () => {
		wallet = env.profiles().findById(getMainsailProfileId()).wallets().first();
		await wallet.synchroniser().identity();

		// Clear localStorage to prevent test interference
		localStorage.clear();
		vi.clearAllMocks();
	});

	it("should initialize with empty pending transactions", () => {
		const { result } = renderHook(() => usePendingTransactions());

		expect(result.current.pendingTransactions).toEqual([]);
		expect(typeof result.current.addPendingTransaction).toBe("function");
		expect(typeof result.current.removePendingTransaction).toBe("function");
	});

	it("should add a pending transaction", async () => {
		const { result } = renderHook(() => usePendingTransactions());

		const mockTransaction = createMockTransaction(wallet);

		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		expect(result.current.pendingTransactions).toHaveLength(1);
		expect(result.current.pendingTransactions[0]).toEqual({
			transaction: signedTransactionData,
			walletAddress: wallet.address()
		});
	});

	it("should add multiple pending transactions", async () => {
		const { result } = renderHook(() => usePendingTransactions());

		const mockTransaction1 = createMockTransaction(wallet);
		const mockTransaction2 = createMockTransaction(wallet, {
			hash: secondSignedTransactionHash,
		});

		act(() => {
			result.current.addPendingTransaction(mockTransaction1);
		});

		act(() => {
			result.current.addPendingTransaction(mockTransaction2);
		});

		expect(result.current.pendingTransactions).toHaveLength(2);
		expect(result.current.pendingTransactions[0].transaction.signedData.hash).toBe(signedTransactionData.signedData.hash);
		expect(result.current.pendingTransactions[1].transaction.signedData.hash).toBe(secondSignedTransactionHash);
	});

	it("should replace duplicate transaction when adding with same hash", async () => {
		const { result } = renderHook(() => usePendingTransactions());

		const mockTransaction = createMockTransaction(wallet);

		// Add the same transaction twice
		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		// Should only have one transaction (duplicate replaced)
		expect(result.current.pendingTransactions).toHaveLength(1);
		expect(result.current.pendingTransactions[0].transaction.signedData.hash).toBe(signedTransactionData.signedData.hash);
	});

	it("should remove a pending transaction by hash", async () => {
		const { result } = renderHook(() => usePendingTransactions());

		const mockTransaction1 = createMockTransaction(wallet);
		const mockTransaction2 = createMockTransaction(wallet, {
			hash: secondSignedTransactionHash,
		});

		// Add two transactions
		act(() => {
			result.current.addPendingTransaction(mockTransaction1);
			result.current.addPendingTransaction(mockTransaction2);
		});

		expect(result.current.pendingTransactions).toHaveLength(2);

		// Remove the first transaction
		act(() => {
			result.current.removePendingTransaction(signedTransactionData.signedData.hash);
		});

		expect(result.current.pendingTransactions).toHaveLength(1);
		expect(result.current.pendingTransactions[0].transaction.signedData.hash).toBe(secondSignedTransactionHash);
	});

	it("should not change pending transactions when removing non-existent hash", async () => {
		const { result } = renderHook(() => usePendingTransactions());

		const mockTransaction = createMockTransaction(wallet);

		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		expect(result.current.pendingTransactions).toHaveLength(1);

		// Try to remove non-existent transaction
		act(() => {
			result.current.removePendingTransaction("non-existent-hash");
		});

		expect(result.current.pendingTransactions).toHaveLength(1);
		expect(result.current.pendingTransactions[0].transaction.signedData.hash).toBe(signedTransactionData.signedData.hash);
	});

	it("should handle error when adding transaction fails", async () => {
		const { result } = renderHook(() => usePendingTransactions());

		// Mock a transaction that throws an error
		const mockTransaction = {
			data: () => {
				throw new Error("Transaction data error");
			},
			hash: () => "test-hash",
			wallet: () => ({
				address: () => "test-address"
			})
		} as unknown as DTO.ExtendedSignedTransactionData;

		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		// Should not add the transaction and should remain empty
		expect(result.current.pendingTransactions).toHaveLength(0);
	});
});
