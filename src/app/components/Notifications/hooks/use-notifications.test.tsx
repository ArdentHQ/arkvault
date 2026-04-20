import { renderHook, act, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import NotificationTransactionsFixtures from "@/tests/fixtures/coins/mainsail/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";
import { useNotifications } from "@/app/components/Notifications/hooks/use-notifications";

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

	it("#transactions", async () => {
		const { result } = renderHook(() => useNotifications({ profile }));
		expect(result.current.transactions).toHaveLength(3);
	});

	it("#markAsRead", async () => {
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
		const { result } = renderHook(() => useNotifications({ profile }));
		const tx = result.current.transactions[1];
		const notif = profile.notifications().transactions().findByTransactionId(tx.hash())!;

		result.current.markAsRead(false, notif.id);

		expect(profile.notifications().get(notif.id).read_at).toBeUndefined();
	});

	it("#markAllTransactionsAsRead", async () => {
		const { result } = renderHook(() => useNotifications({ profile }));

		result.current.markAllTransactionsAsRead(true);

		expect(profile.notifications().transactions().recent()[0].read_at).toBeTruthy();
		expect(profile.notifications().transactions().recent()[1].read_at).toBeTruthy();

		result.current.markAllTransactionsAsRead(false);

		expect(profile.notifications().transactions().recent()[0].read_at).toBeTruthy();
		expect(profile.notifications().transactions().recent()[1].read_at).toBeTruthy();
	});

	it("triggers initial sync when there is no live data and not syncing", async () => {
		const txService = profile.notifications().transactions();

		const syncSpy = vi.spyOn(txService, "sync").mockResolvedValue();
		const isSyncingSpy = vi.spyOn(txService, "isSyncing").mockReturnValue(false);
		const transactionsSpy = vi.spyOn(txService, "transactions").mockReturnValue([]);

		renderHook(() => useNotifications({ profile }));

		await waitFor(() => expect(syncSpy).toHaveBeenCalledTimes(1));

		syncSpy.mockRestore();
		isSyncingSpy.mockRestore();
		transactionsSpy.mockRestore();
	});

	it("isNotificationUnread returns true for unread matching notification and false after markAsRead", async () => {
		const { result, rerender } = renderHook(() => useNotifications({ profile }));

		const tx = result.current.transactions[0];
		const notif = profile.notifications().transactions().findByTransactionId(tx.hash())!;

		profile.notifications().get(notif.id).read_at = undefined;
		rerender();

		expect(result.current.isNotificationUnread(tx)).toBe(true);

		profile.notifications().markAsRead(notif.id);
		rerender();

		expect(result.current.isNotificationUnread(tx)).toBe(false);
	});
});
