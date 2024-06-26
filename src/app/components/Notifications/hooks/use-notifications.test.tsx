/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { useNotifications } from "./use-notifications";
import { env, getDefaultProfileId } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/ark/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

let profile: Contracts.IProfile;

describe("useNotifications", () => {
	beforeAll(async () => {
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: NotificationTransactionsFixtures.data,
				meta: TransactionsFixture.meta,
			}),
		);

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		profile
			.notifications()
			.releases()
			.push({
				meta: { version: "3.0.0" },
				name: "Wallet update",
			});

		await profile.notifications().transactions().sync();
	});

	it("#releases", async () => {
		const { result } = renderHook(() => useNotifications({ profile }));

		expect(result.current.releases).toHaveLength(2);
	});

	it("#transactions", async () => {
		const { result } = renderHook(() => useNotifications({ profile }));

		expect(result.current.transactions).toHaveLength(3);
	});

	it("#markAsRead", async () => {
		const { result } = renderHook(() => useNotifications({ profile }));
		const notification = result.current.releases[0];

		result.current.markAsRead(true, notification.id);

		expect(profile.notifications().get(notification.id).read_at).toBeTruthy();
	});

	it("should not mark as read if not visible", async () => {
		const { result } = renderHook(() => useNotifications({ profile }));
		const notification = result.current.releases[1];

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
