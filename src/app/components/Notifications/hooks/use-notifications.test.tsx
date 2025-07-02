import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";

import { useNotifications } from "./use-notifications";
import { env, getMainsailProfileId } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/mainsail/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

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
		const notification = result.current.transactions[0];

		result.current.markAsRead(true, notification.id);

		expect(profile.notifications().get(notification.id).read_at).toBeTruthy();
	});

	it("should not mark as read if not visible", async () => {
		const { result } = renderHook(() => useNotifications({ profile }));
		const notification = result.current.transactions[1];

		result.current.markAsRead(false, notification.id);

		expect(profile.notifications().get(notification.id).read_at).toBeUndefined();
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
});
