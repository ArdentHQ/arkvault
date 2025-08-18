import { usePendingTransactions } from "./use-pending-transactions";
import { act, renderHook } from "@/utils/testing-library";
import { DTO } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { expect, vi } from "vitest";

const mockSetPendingJson = vi.fn();
const mockPendingJson: any[] = [];

const createMockTransaction = (): DTO.ExtendedSignedTransactionData => {
  const mockWallet = {
    address: vi.fn().mockReturnValue("test-address"),
    networkId: vi.fn().mockReturnValue("mainsail"),
  };

  const dataL2 = { data: "0x" };
  const dataL1 = { data: vi.fn().mockReturnValue(dataL2) };

  return {
    explorerLink: vi.fn().mockReturnValue("https://explorer.test/tx/hash123"),
    from: vi.fn().mockReturnValue("from-address"),
    hash: vi.fn().mockReturnValue("hash123"),
    nonce: vi.fn().mockReturnValue(new BigNumber(123)),
    to: vi.fn().mockReturnValue("to-address"),
    value: vi.fn().mockReturnValue(100),
    wallet: vi.fn().mockReturnValue(mockWallet),
    data: vi.fn().mockReturnValue(dataL1),
  } as unknown as DTO.ExtendedSignedTransactionData;
};

vi.mock("usehooks-ts", () => ({
  useLocalStorage: vi.fn(() => [mockPendingJson, mockSetPendingJson]),
}));

describe("usePendingTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPendingJson.length = 0;
  });

  it("should render and keep stable function refs", () => {
    const { result, rerender } = renderHook(() => usePendingTransactions());

    const firstRefs = {
      add: result.current.addPendingTransaction,
      rem: result.current.removePendingTransaction,
      addUnc: result.current.addPendingTransactionFromUnconfirmed,
      build: result.current.buildPendingForUI,
    };

    rerender();

    expect(result.current.addPendingTransaction).toBe(firstRefs.add);
    expect(result.current.removePendingTransaction).toBe(firstRefs.rem);
    expect(result.current.addPendingTransactionFromUnconfirmed).toBe(firstRefs.addUnc);
    expect(result.current.buildPendingForUI).toBe(firstRefs.build);
  });

  it("should initialize with empty pendingJson", () => {
    const { result } = renderHook(() => usePendingTransactions());

    expect(result.current.pendingJson).toEqual([]);
    expect(typeof result.current.addPendingTransaction).toBe("function");
    expect(typeof result.current.addPendingTransactionFromUnconfirmed).toBe("function");
    expect(typeof result.current.removePendingTransaction).toBe("function");
    expect(typeof result.current.buildPendingForUI).toBe("function");
  });

  it("should add a new pending transaction via addPendingTransaction (signed tx path)", () => {
    const mockTx = createMockTransaction();
    const { result } = renderHook(() => usePendingTransactions());

    act(() => {
      result.current.addPendingTransaction(mockTx);
    });

    expect(mockSetPendingJson).toHaveBeenCalledWith(expect.any(Function));

    const callback = mockSetPendingJson.mock.calls[0][0];
    const prev: any[] = [];
    const next = callback(prev);

    expect(next).toHaveLength(1);
    const item = next[0];

    expect(item.hash).toBe("hash123");
    expect(item.from).toBe("from-address");
    expect(item.to).toBe("to-address");
    expect(item.value).toBe("100");
    expect(item.nonce).toBe("123");
    expect(item.data).toBe("0x");
    expect(typeof item.createdAt).toBe("string");
    expect(item.meta?.address).toBe("test-address");
    expect(item.meta?.networkId).toBe("mainsail");
    expect(item.meta?.explorerLink).toBe("https://explorer.test/tx/hash123");
  });

  it("should add a new pending transaction via addPendingTransactionFromUnconfirmed", () => {
    const { result } = renderHook(() => usePendingTransactions());

    act(() => {
      result.current.addPendingTransactionFromUnconfirmed({
        from: "0xFrom",
        to: "0xTo",
        hash: "hashABC",
        value: "42",
        nonce: "7",
        data: "0x",
        gasPrice: "5",
        gasLimit: "21000",
        walletAddress: "test-address",
        networkId: "mainsail",
        explorerLink: "https://explorer/tx/hashABC",
      });
    });

    expect(mockSetPendingJson).toHaveBeenCalledWith(expect.any(Function));

    const callback = mockSetPendingJson.mock.calls[0][0];
    const prev: any[] = [];
    const next = callback(prev);

    expect(next).toHaveLength(1);
    const item = next[0];

    expect(item.hash).toBe("hashABC");
    expect(item.from).toBe("0xFrom");
    expect(item.to).toBe("0xTo");
    expect(item.value).toBe("42");
    expect(item.nonce).toBe("7");
    expect(item.data).toBe("0x");
    expect(item.meta?.address).toBe("test-address");
    expect(item.meta?.networkId).toBe("mainsail");
    expect(item.meta?.explorerLink).toBe("https://explorer/tx/hashABC");
  });

  it("should replace existing transaction with the same hash", () => {
    const mockTx = createMockTransaction();
    const { result } = renderHook(() => usePendingTransactions());

    act(() => {
      result.current.addPendingTransaction(mockTx);
    });

    expect(mockSetPendingJson).toHaveBeenCalledWith(expect.any(Function));
    const callback = mockSetPendingJson.mock.calls[0][0];

    const prev = [
      {
        hash: "hash123",
        from: "old-from",
        to: "old-to",
        value: "1",
        nonce: "1",
        data: "0x",
        gasPrice: "0",
        gas: 0,
        v: 0,
        r: "",
        s: "",
        senderPublicKey: "",
        network: 0,
        createdAt: new Date().toISOString(),
        meta: { address: "test-address", networkId: "mainsail" },
      },
    ];

    const next = callback(prev);

    expect(next).toHaveLength(1);
    expect(next[0].hash).toBe("hash123");
    expect(next[0].from).toBe("from-address"); // replaced by the new item
  });

  it("should remove transaction by hash", () => {
    const { result } = renderHook(() => usePendingTransactions());

    act(() => {
      result.current.removePendingTransaction("hash123");
    });

    expect(mockSetPendingJson).toHaveBeenCalledWith(expect.any(Function));

    const callback = mockSetPendingJson.mock.calls[0][0];
    const prev = [
      { hash: "hash123", value: "100" },
      { hash: "hash456", value: "200" },
    ];
    const filtered = callback(prev);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].hash).toBe("hash456");
  });

  it("buildPendingForUI: adapts persisted JSON into confirmed-like rows", () => {
    mockPendingJson.push({
      hash: "h1",
      from: "from-1",
      to: "test-address",
      value: "10",
      nonce: "1",
      data: "0x",
      gasPrice: "0",
      gas: 0,
      v: 0,
      r: "",
      s: "",
      senderPublicKey: "",
      network: 0,
      createdAt: new Date().toISOString(),
      meta: { address: "test-address", networkId: "mainsail", explorerLink: "https://explorer/tx/h1" },
    });

    const { result } = renderHook(() => usePendingTransactions());

    const wallets = [
      {
        address: () => "test-address",
        network: () => ({ id: "mainsail" }),
      },
    ] as any;

    const rows = result.current.buildPendingForUI(["test-address"], wallets);
    expect(rows).toHaveLength(1);

    const row = rows[0];
    expect(row.isPending()).toBe(true);
    expect(row.hash()).toBe("h1");
    expect(row.to()).toBe("test-address");
    expect(row.from()).toBe("from-1");
    expect(row.explorerLink()).toBe("https://explorer/tx/h1");
    expect(typeof row.timestamp().toUNIX()).toBe("number");
  });
});
