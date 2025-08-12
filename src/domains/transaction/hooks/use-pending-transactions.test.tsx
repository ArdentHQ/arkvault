import { usePendingTransactions } from "./use-pending-transactions";
import { act, renderHook } from "@/utils/testing-library";
import { DTO } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { expect, vi } from "vitest";

const mockSetPendingTransactions = vi.fn();
const mockPendingTransactions = [];

const createMockTransaction = (): DTO.ExtendedSignedTransactionData => {
	const mockWallet = {
		address: vi.fn().mockReturnValue("test-address"),
		networkId: vi.fn().mockReturnValue("mainsail"),
	};

	return {
		convertedAmount: vi.fn().mockReturnValue(100),
		convertedTotal: vi.fn().mockReturnValue(110),
		explorerLink: vi.fn().mockReturnValue("https://explorer.test/tx/hash123"),
		fee: vi.fn().mockReturnValue(10),
		from: vi.fn().mockReturnValue("from-address"),
		hash: vi.fn().mockReturnValue("hash123"),
		isMultiPayment: vi.fn().mockReturnValue(false),
		isReturn: vi.fn().mockReturnValue(false),
		isTransfer: vi.fn().mockReturnValue(true),
		isUnvote: vi.fn().mockReturnValue(false),
		isUpdateValidator: vi.fn().mockReturnValue(false),
		isUsernameRegistration: vi.fn().mockReturnValue(false),
		isUsernameResignation: vi.fn().mockReturnValue(false),
		isValidatorRegistration: vi.fn().mockReturnValue(false),
		isValidatorResignation: vi.fn().mockReturnValue(false),
		isVote: vi.fn().mockReturnValue(false),
		isVoteCombination: vi.fn().mockReturnValue(false),
		nonce: vi.fn().mockReturnValue(new BigNumber(123)),
		recipients: vi.fn().mockReturnValue([{ address: "recipient1", amount: 50 }]),
		timestamp: vi.fn().mockReturnValue(1640995200000),
		to: vi.fn().mockReturnValue("to-address"),
		total: vi.fn().mockReturnValue(110),
		type: vi.fn().mockReturnValue("transfer"),
		value: vi.fn().mockReturnValue(100),
		wallet: vi.fn().mockReturnValue(mockWallet),
	} as unknown as DTO.ExtendedSignedTransactionData;
};

vi.mock("usehooks-ts", () => ({
	useLocalStorage: vi.fn(() => [mockPendingTransactions, mockSetPendingTransactions]),
}));

describe("usePendingTransactions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render", () => {
		const { result, rerender } = renderHook(() => usePendingTransactions());

		const firstRender = {
			addPendingTransaction: result.current.addPendingTransaction,
			removePendingTransaction: result.current.removePendingTransaction,
		};

		rerender();

		expect(result.current.addPendingTransaction).toBe(firstRender.addPendingTransaction);
		expect(result.current.removePendingTransaction).toBe(firstRender.removePendingTransaction);
	});

	it("should initialize with empty array", () => {
		const { result } = renderHook(() => usePendingTransactions());

		expect(result.current.pendingTransactions).toEqual([]);
		expect(typeof result.current.addPendingTransaction).toBe("function");
		expect(typeof result.current.removePendingTransaction).toBe("function");
	});

	it("should add a new pending transaction", () => {
		const mockTransaction = createMockTransaction();
		const { result } = renderHook(() => usePendingTransactions());

		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		expect(mockSetPendingTransactions).toHaveBeenCalledWith(expect.any(Function));

		const callback = mockSetPendingTransactions.mock.calls[0][0];
		const prevTransactions = [];
		const newTransactions = callback(prevTransactions);

		expect(newTransactions).toHaveLength(1);
		expect(newTransactions[0]).toEqual({
			convertedAmount: 100,
			convertedTotal: 110,
			explorerLink: "https://explorer.test/tx/hash123",
			fee: 10,
			from: "from-address",
			hash: "hash123",
			isMultiPayment: false,
			isReturn: false,
			isTransfer: true,
			isUnvote: false,
			isUpdateValidator: false,
			isUsernameRegistration: false,
			isUsernameResignation: false,
			isValidatorRegistration: false,
			isValidatorResignation: false,
			isVote: false,
			isVoteCombination: false,
			networkId: "mainsail",
			nonce: expect.any(BigNumber),
			recipients: [{ address: "recipient1", amount: 50 }],
			timestamp: expect.any(DateTime),
			to: "to-address",
			total: 110,
			type: "transfer",
			value: 100,
			walletAddress: "test-address",
		});
	});

	it("should replace existing transaction with same hash", () => {
		const mockTransaction = createMockTransaction();
		const { result } = renderHook(() => usePendingTransactions());

		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		const callback = mockSetPendingTransactions.mock.calls[0][0];
		const prevTransactions = [
			{
				convertedAmount: 50,
				convertedTotal: 60,
				explorerLink: "https://explorer.test/tx/hash123",
				fee: 5,
				from: "from-address",
				hash: "hash123",
				isMultiPayment: false,
				isReturn: false,
				isTransfer: true,
				isUnvote: false,
				isUpdateValidator: false,
				isUsernameRegistration: false,
				isUsernameResignation: false,
				isValidatorRegistration: false,
				isValidatorResignation: false,
				isVote: false,
				isVoteCombination: false,
				networkId: "devnet",
				nonce: new BigNumber(1),
				recipients: [],
				timestamp: DateTime.make(1234567890),
				to: "to-address",
				total: 60,
				type: "transfer",
				value: 50,
				walletAddress: "test-address",
			},
		];

		const newTransactions = callback(prevTransactions);

		expect(newTransactions).toHaveLength(1);
		expect(newTransactions[0].hash).toBe("hash123");
		expect(newTransactions[0].convertedAmount).toBe(100);
	});

	it("should handle transaction without recipients", () => {
		const mockTransaction = createMockTransaction();
		mockTransaction.recipients = undefined;

		const { result } = renderHook(() => usePendingTransactions());

		act(() => {
			result.current.addPendingTransaction(mockTransaction);
		});

		const callback = mockSetPendingTransactions.mock.calls[0][0];
		const newTransactions = callback([]);

		expect(newTransactions[0].recipients).toBeUndefined();
	});

	it("should remove transaction by hash", () => {
		const { result } = renderHook(() => usePendingTransactions());

		act(() => {
			result.current.removePendingTransaction("hash123");
		});

		expect(mockSetPendingTransactions).toHaveBeenCalledWith(expect.any(Function));

		const callback = mockSetPendingTransactions.mock.calls[0][0];
		const prevTransactions = [
			{ hash: "hash123", value: 100 },
			{ hash: "hash456", value: 200 },
		];
		const filteredTransactions = callback(prevTransactions);

		expect(filteredTransactions).toHaveLength(1);
		expect(filteredTransactions[0].hash).toBe("hash456");
	});

	it("should do nothing if hash doesn't exist", () => {
		const { result } = renderHook(() => usePendingTransactions());

		act(() => {
			result.current.removePendingTransaction("nonexistent-hash");
		});

		const callback = mockSetPendingTransactions.mock.calls[0][0];
		const prevTransactions = [
			{ hash: "hash123", value: 100 },
			{ hash: "hash456", value: 200 },
		];
		const filteredTransactions = callback(prevTransactions);

		expect(filteredTransactions).toHaveLength(2);
		expect(filteredTransactions).toEqual(prevTransactions);
	});
});
