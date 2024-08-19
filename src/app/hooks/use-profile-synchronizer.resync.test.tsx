/* eslint-disable @typescript-eslint/require-await */
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useProfileSynchronizer } from "./use-profile-synchronizer";
import { useConfiguration } from "@/app/contexts";
import {
	act as renderAct,
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("useProfileSyncStatus", () => {
	it("should sync profile and handle resync with errored networks", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		history.push(dashboardURL);

		let configuration: any;
		let profileErroredNetworks: string[] = [];

		const onProfileSyncError = (erroredNetworks: string[], retrySync) => {
			profileErroredNetworks = erroredNetworks;
			retrySync();
		};

		const onProfileSyncStart = vi.fn();

		const Component = () => {
			configuration = useConfiguration();

			useProfileSynchronizer({
				onProfileSyncError,
				onProfileSyncStart,
			});

			return <div data-testid="ProfileSynced">test</div>;
		};

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Component />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		const profile = env.profiles().findById(getDefaultProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const mockWalletSyncStatus = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

		await renderAct(async () => {
			configuration.setConfiguration({ profileIsSyncingWallets: true });
		});
		await waitFor(() => expect(configuration.profileIsSyncingWallets).toBe(true), { timeout: 5000 });

		await renderAct(async () => {
			configuration.setConfiguration({ profileIsSyncingWallets: false });
		});

		expect(onProfileSyncStart).toHaveBeenCalledTimes(2);

		await waitFor(() => expect(configuration.profileIsSyncingWallets).toBe(false));
		await waitFor(() => expect(profileErroredNetworks).toHaveLength(1));

		mockWalletSyncStatus.mockRestore();
		resetProfileNetworksMock();

		vi.useRealTimers();
		vi.clearAllTimers();
	});

	it("should sync profile and handle resync with sync error", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		history.push(dashboardURL);
		let configuration: any;

		const onProfileSyncError = vi.fn().mockImplementation((erroredNetworks: string[], retrySync) => {
			retrySync();
		});
		const onProfileSyncStart = vi.fn();

		const profile = env.profiles().findById(getDefaultProfileId());
		const profileSyncSpy = vi.spyOn(profile, "sync").mockImplementationOnce(() => {
			throw new Error("unknown");
		});

		const Component = () => {
			configuration = useConfiguration();

			useProfileSynchronizer({
				onProfileSyncError,
				onProfileSyncStart,
			});

			return <div data-testid="ProfileSyncedWithError">test</div>;
		};

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Component />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("ProfileSyncedWithError")).resolves.toBeVisible();

		const mockWalletSyncStatus = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

		await renderAct(async () => {
			configuration.setConfiguration({ profileIsSyncingWallets: true });
		});

		await waitFor(() => expect(configuration.profileIsSyncingWallets).toBe(true));

		mockWalletSyncStatus.mockRestore();
		profileSyncSpy.mockRestore();
		vi.clearAllTimers();
		vi.useRealTimers();
	});
	it("should restore profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		const profile = env.profiles().findById(getDefaultProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		await env.profiles().restore(profile);

		profile.settings().set(Contracts.ProfileSetting.AutomaticSignOutPeriod, 1);
		await env.persist();

		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		history.push(`/profiles/${profile.id()}/dashboard`);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="ProfileRestored">test</div>
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/dashboard`,
				withProfileSynchronizer: true,
			},
		);

		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		await expect(screen.findByTestId("ProfileRestored", undefined, { timeout: 4000 })).resolves.toBeVisible();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

		profileStatusMock.mockRestore();
		historyMock.mockRestore();
		resetProfileNetworksMock();

		vi.clearAllTimers();
	});
});
