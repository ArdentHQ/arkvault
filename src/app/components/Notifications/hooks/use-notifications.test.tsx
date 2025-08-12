import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import NotificationTransactionsFixtures from "@/tests/fixtures/coins/mainsail/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";
import { useLocalStorage } from "usehooks-ts";
import { useNotifications } from "@/app/components/Notifications/hooks/use-notifications";

vi.mock("usehooks-ts", () => ({
	useLocalStorage: vi.fn(),
}));

const setCached = (value: any) => {
	(useLocalStorage as unknown as Mock).mockReturnValue([value, vi.fn()]);
};

const mockCachedTransaction = (overrides: any = {}) => ({
	_rawData: { fee: "0.1", ...(overrides._rawData ?? {}) },
	fee: "0.1",
	from: "ADDRESS_FROM",
	hash: "tx-1",
	isMultiPayment: false,
	isReceived: false,
	isSent: true,
	isUnvote: false,
	isUsernameRegistration: false,
	isUsernameResignation: false,
	isValidatorRegistration: false,
	isVote: false,
	isVoteCombination: false,
	recipients: ["ADDRESS_TO"],
	timestamp: { toISOString: "2025-08-10T00:00:00.000Z", toUNIX: 1765411200 },
	to: "ADDRESS_TO",
	type: "transfer",
	value: "1",
	wallet: {
		currency: "DARK",
		network: { coin: "DARK", id: "mainsail", name: "Mainsail Devnet" },
	},
	...overrides,
});

const seedCache = (transactions: any[], { now = 1_000_000, ageMs = 60 * 60 * 1000 } = {}) => {
	const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);
	setCached({ lastSync: now - ageMs, notifications: [], transactions });
	return nowSpy;
};

const stubNoLiveData = (profile: Contracts.IProfile, overrides: any = {}) => {
	const notifCenter = profile.notifications();
	const mgr = {
		isSyncing: vi.fn().mockReturnValue(false),
		markAllAsRead: vi.fn(),
		sync: vi.fn(),
		transactions: vi.fn().mockReturnValue([]),
		...overrides,
	};
	vi.spyOn(notifCenter, "transactions").mockReturnValue(mgr as any);
	vi.spyOn(notifCenter, "all").mockReturnValue({} as any);
	return mgr;
};

let profile: Contracts.IProfile;

describe("useNotifications", () => {
	beforeAll(async () => {
		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: NotificationTransactionsFixtures.data,
				meta: TransactionsFixture.meta,
			}),
		);

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
		await profile.notifications().transactions().sync();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("#transactions", async () => {
		setCached(null);
		const { result } = renderHook(() => useNotifications({ profile }));
		expect(result.current.transactions).toHaveLength(3);
	});

	it("#markAsRead", async () => {
		setCached(null);
		const { result } = renderHook(() => useNotifications({ profile }));

		const all = Object.values(profile.notifications().all());
		const target = (all as any[]).find((n) => n.read_at === undefined) ?? (all as any[])[0];
		const id = target.id;

		expect(profile.notifications().get(id).read_at).toBeUndefined();

		act(() => {
			result.current.markAsRead(true, id);
		});

		expect(profile.notifications().get(id).read_at).toBeTruthy();
	});

	it("should not mark as read if not visible", async () => {
		setCached(null);
		const { result } = renderHook(() => useNotifications({ profile }));

		const all = Object.values(profile.notifications().all());
		const target = (all as any[]).find((n) => n.read_at === undefined) ?? (all as any[])[0];
		const id = target.id;

		act(() => {
			result.current.markAsRead(false, id);
		});

		expect(profile.notifications().get(id).read_at).toBeUndefined();
	});

	it("#markAllTransactionsAsRead", async () => {
		setCached(null);
		const { result } = renderHook(() => useNotifications({ profile }));

		act(() => {
			result.current.markAllTransactionsAsRead(true);
		});

		expect(profile.notifications().transactions().recent()[0].read_at).toBeTruthy();
		expect(profile.notifications().transactions().recent()[1].read_at).toBeTruthy();

		act(() => {
			result.current.markAllTransactionsAsRead(false);
		});

		expect(profile.notifications().transactions().recent()[0].read_at).toBeTruthy();
		expect(profile.notifications().transactions().recent()[1].read_at).toBeTruthy();
	});

	it("should return cached transactions when recent cache exists and no live data", () => {
		const nowSpy = seedCache([mockCachedTransaction()], { now: 1_000_000 });

		stubNoLiveData(profile);

		const { result } = renderHook(() => useNotifications({ profile }));
		expect(result.current.transactions).toHaveLength(1);

		const tx = result.current.transactions[0];
		expect(tx.hash()).toBe("tx-1");
		expect(tx.to()).toBe("ADDRESS_TO");
		expect(tx.from()).toBe("ADDRESS_FROM");
		expect(tx.value()).toBe("1");
		expect(tx.fee()).toBe("0.1");
		expect(tx.recipients()).toEqual(["ADDRESS_TO"]);
		expect(tx.type()).toBe("transfer");
		expect(tx.timestamp()!.toISOString()).toBe("2025-08-10T00:00:00.000Z");
		expect(tx.timestamp()!.toUNIX()).toBe(1765411200);
		expect(tx.wallet().currency()).toBe("DARK");
		expect(tx.wallet().network().coin()).toBe("DARK");
		expect(tx.wallet().network().id()).toBe("mainsail");
		expect(tx.wallet().network().name()).toBe("Mainsail Devnet");
		expect(tx.toObject()).toEqual({ fee: "0.1" });
		expect(tx.isSent()).toBe(true);
		expect(tx.isReceived()).toBe(false);
		expect(tx.isMultiPayment()).toBe(false);
		expect(tx.isVoteCombination()).toBe(false);
		expect(tx.isVote()).toBe(false);
		expect(tx.isUnvote()).toBe(false);
		expect(tx.isUsernameRegistration()).toBe(false);
		expect(tx.isUsernameResignation()).toBe(false);
		expect(tx.isValidatorRegistration()).toBe(false);

		nowSpy.mockRestore();
	});

	it("should sync on initialization when no live or cached data and not syncing", async () => {
		setCached(null);

		const mgr = stubNoLiveData(profile);
		mgr.sync.mockResolvedValue(undefined);

		renderHook(() => useNotifications({ profile }));

		await waitFor(() => {
			expect(mgr.sync).toHaveBeenCalledTimes(1);
		});
	});

	it("should return true only for matching unread notifications", () => {
		setCached(null);

		const notifCenter = profile.notifications();
		const txHash = "abc-123";
		const allSpy = vi.spyOn(notifCenter, "all");

		allSpy.mockReturnValue({
			n1: { id: "n1", meta: { transactionId: txHash }, read_at: undefined },
		} as any);

		const { result, rerender } = renderHook(() => useNotifications({ profile }));
		const fakeTx = { hash: () => txHash } as any;

		expect(result.current.isNotificationUnread(fakeTx)).toBe(true);

		allSpy.mockReturnValue({
			n1: { id: "n1", meta: { transactionId: txHash }, read_at: new Date().toISOString() },
		} as any);
		rerender();

		expect(result.current.isNotificationUnread(fakeTx)).toBe(false);
	});

	it("returns cached transactions when recent cache exists and no live data (multiple)", () => {
		const nowSpy = seedCache(
			[
				mockCachedTransaction(),
				mockCachedTransaction({
					_rawData: { baz: "qux" },
					fee: "0.2",
					from: "ADDRESS_FROM_2",
					hash: "tx-2",
					isMultiPayment: true,
					isReceived: true,
					isSent: false,
					isUsernameRegistration: true,
					isValidatorRegistration: true,
					isVote: true,
					isVoteCombination: true,
					recipients: undefined,
					timestamp: undefined,
					to: "ADDRESS_TO_2",
					type: "vote",
					value: "2",
				}),
			],
			{ now: 1_000_000 },
		);

		stubNoLiveData(profile);

		const { result } = renderHook(() => useNotifications({ profile }));
		expect(result.current.transactions).toHaveLength(2);

		const tx1 = result.current.transactions.find((t) => t.hash() === "tx-1")!;
		expect(tx1.hash()).toBe("tx-1");
		expect(tx1.to()).toBe("ADDRESS_TO");
		expect(tx1.from()).toBe("ADDRESS_FROM");
		expect(tx1.value()).toBe("1");
		expect(tx1.fee()).toBe("0.1");
		expect(tx1.isSent()).toBe(true);
		expect(tx1.isReceived()).toBe(false);
		expect(tx1.isMultiPayment()).toBe(false);
		expect(tx1.isVoteCombination()).toBe(false);
		expect(tx1.isVote()).toBe(false);
		expect(tx1.isUnvote()).toBe(false);
		expect(tx1.isUsernameRegistration()).toBe(false);
		expect(tx1.isUsernameResignation()).toBe(false);
		expect(tx1.isValidatorRegistration()).toBe(false);
		expect(tx1.type()).toBe("transfer");
		expect(tx1.recipients()).toEqual(["ADDRESS_TO"]);
		expect(tx1.timestamp()!.toISOString()).toBe("2025-08-10T00:00:00.000Z");
		expect(tx1.timestamp()!.toUNIX()).toBe(1765411200);
		expect(tx1.wallet().currency()).toBe("DARK");
		expect(tx1.wallet().network().coin()).toBe("DARK");
		expect(tx1.wallet().network().id()).toBe("mainsail");
		expect(tx1.wallet().network().name()).toBe("Mainsail Devnet");
		expect(tx1.toObject()).toEqual({ fee: "0.1" });

		const tx2 = result.current.transactions.find((t) => t.hash() === "tx-2")!;
		expect(tx2.hash()).toBe("tx-2");
		expect(tx2.to()).toBe("ADDRESS_TO_2");
		expect(tx2.from()).toBe("ADDRESS_FROM_2");
		expect(tx2.value()).toBe("2");
		expect(tx2.fee()).toBe("0.2");
		expect(tx2.isSent()).toBe(false);
		expect(tx2.isReceived()).toBe(true);
		expect(tx2.isMultiPayment()).toBe(true);
		expect(tx2.isVoteCombination()).toBe(true);
		expect(tx2.isVote()).toBe(true);
		expect(tx2.isUnvote()).toBe(false);
		expect(tx2.isUsernameRegistration()).toBe(true);
		expect(tx2.isUsernameResignation()).toBe(false);
		expect(tx2.isValidatorRegistration()).toBe(true);
		expect(tx2.type()).toBe("vote");
		expect(tx2.recipients()).toEqual([]);
		expect(tx2.timestamp()).toBeNull();
		expect(tx2.wallet().currency()).toBe("DARK");
		expect(tx2.wallet().network().coin()).toBe("DARK");
		expect(tx2.wallet().network().id()).toBe("mainsail");
		expect(tx2.wallet().network().name()).toBe("Mainsail Devnet");
		expect(tx2.toObject()).toEqual({ baz: "qux" });

		nowSpy.mockRestore();
	});

	it("should return empty array when recent cache has no transactions", () => {
		const nowSpy = seedCache([], { ageMs: 5_000, now: 2_000_000 });
		stubNoLiveData(profile);

		const { result } = renderHook(() => useNotifications({ profile }));
		expect(result.current.transactions).toEqual([]);

		nowSpy.mockRestore();
	});
});
