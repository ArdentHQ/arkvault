import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import nock from "nock";
import React from "react";

import { useLatestTransactions } from "./use-latest-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import {
	env,
	getDefaultProfileId,
	syncDelegates,
	useDefaultNetMocks,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("useLatestTransactions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		useDefaultNetMocks();

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions")
			.query(true)
			.reply(200, () => require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.persist();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should get latest transactions", async () => {
		const sent = await profile.transactionAggregate().all({ limit: 10 });
		const items = sent.items();

		const mockTransactionsAggregate = jest
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => items } as any));

		const { result, waitForNextUpdate } = renderHook(
			() => useLatestTransactions({ profile, profileIsSyncing: false }),
			{ wrapper },
		);

		await waitForNextUpdate();
		await waitFor(() => expect(result.current.isLoadingTransactions).toBeFalsy());

		expect(result.current.latestTransactions).toHaveLength(10);

		mockTransactionsAggregate.mockRestore();
	});

	it("should render loading state when profile is syncing", async () => {
		jest.useFakeTimers();

		const mockTransactionsAggregate = jest
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => [] } as any));

		const { result, waitForNextUpdate } = renderHook(
			() => useLatestTransactions({ profile, profileIsSyncing: true }),
			{ wrapper },
		);

		jest.runOnlyPendingTimers();

		await waitForNextUpdate();
		await waitFor(() => expect(result.current.isLoadingTransactions).toBeTruthy());

		mockTransactionsAggregate.mockRestore();

		jest.clearAllTimers();
	});
});
