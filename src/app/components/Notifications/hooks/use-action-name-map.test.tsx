/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";

import { useActionNameMap } from "./use-action-name-map";
import { env, getMainsailProfileId } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/mainsail/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

let profile: Contracts.IProfile;

describe("useActionNameMap", () => {
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
