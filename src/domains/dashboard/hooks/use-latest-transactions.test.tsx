/* eslint-disable max-lines-per-function */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import React from "react";

import { useLatestTransactions } from "./use-latest-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import {
	env,
	getDefaultProfileId,
	syncDelegates,
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

		const mockTransactionsAggregate = vi
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => items.slice(0, 10) } as any));

		const { result } = renderHook(() => useLatestTransactions({ profile, profileIsSyncing: false }), { wrapper });

		await waitFor(() => expect(result.current.isLoadingTransactions).toBeFalsy());

		expect(result.current.latestTransactions).toHaveLength(10);

		mockTransactionsAggregate.mockRestore();
	});

	it("should render loading state when profile is syncing", () => {
		vi.useFakeTimers();

		const mockTransactionsAggregate = vi
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => [] } as any));

		const { result } = renderHook(() => useLatestTransactions({ profile, profileIsSyncing: true }), { wrapper });

		vi.runOnlyPendingTimers();

		expect(result.current.isLoadingTransactions).toBeTruthy();

		mockTransactionsAggregate.mockRestore();

		vi.clearAllTimers();
	});
});
