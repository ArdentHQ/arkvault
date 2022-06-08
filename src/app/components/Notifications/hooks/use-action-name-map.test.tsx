/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import nock from "nock";

import { useActionNameMap } from "./use-action-name-map";
import { env, getDefaultProfileId } from "@/utils/testing-library";

const NotificationTransactionsFixtures = require("tests/fixtures/coins/ark/devnet/notification-transactions.json");
const TransactionsFixture = require("tests/fixtures/coins/ark/devnet/transactions.json");

let profile: Contracts.IProfile;

describe("useActionNameMap", () => {
	beforeAll(async () => {
		nock("https://ark-test.arkvault.io").get("/api/transactions").query(true).reply(200, {
			data: NotificationTransactionsFixtures.data,
			meta: TransactionsFixture.meta,
		});

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
