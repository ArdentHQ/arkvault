/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { useActionNameMap } from "./use-action-name-map";
import { env, getDefaultProfileId } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/ark/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

let profile: Contracts.IProfile;

describe("useActionNameMap", () => {
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

	it("should map changelog name", async () => {
		const { result } = renderHook(() => useActionNameMap());

		expect(result.current.mapActionName("Read Changelog").value).toBe("changelog");
	});

	it("should map update changelog name", async () => {
		const { result } = renderHook(() => useActionNameMap());

		expect(result.current.mapActionName("update").value).toBe("update");
	});

	it("should default to custom action name", async () => {
		const { result } = renderHook(() => useActionNameMap());

		expect(result.current.mapActionName("custom name").value).toBe("custom name");
	});
});
