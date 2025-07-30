import React from "react";

import { Contracts } from "@/app/lib/profiles";
import { useProfileSynchronizer } from "./use-profile-synchronizer";
import { useConfiguration } from "@/app/contexts";
import {
	act as renderAct,
	env,
	getMainsailProfileId,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("useProfileSyncStatus", () => {
	it("should sync profile and handle resync with errored networks", async () => {
		let configuration: any;
		let profileErroredNetworks: string[] = [];

		const onProfileSyncError = (erroredNetworks: string[], retrySync) => {
			profileErroredNetworks = erroredNetworks;
			retrySync();
		};

		const onProfileSyncStart = vi.fn();

		const Component = () => {
			configuration = useConfiguration();
			useProfileSynchronizer({ onProfileSyncError, onProfileSyncStart });
			return <div data-testid="ProfileSynced">test</div>;
		};

		render(<Component />, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		const profile = env.profiles().findById(getMainsailProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const mockWalletSyncStatus = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

		await waitFor(() =>
			expect(configuration.getProfileConfiguration(profile.id()).profileIsSyncingWallets).toBe(false),
		);

		await renderAct(() => {
			configuration.setConfiguration(profile.id(), { profileIsSyncingWallets: true });
		});
		await waitFor(() =>
			expect(configuration.getProfileConfiguration(profile.id()).profileIsSyncingWallets).toBe(true),
		);

		expect(onProfileSyncStart).toHaveBeenCalledTimes(2);

		await waitFor(() => expect(profileErroredNetworks).toHaveLength(1));

		mockWalletSyncStatus.mockRestore();
		resetProfileNetworksMock();
	});

	it("should sync profile and handle resync with sync error", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		let configuration: any;

		const onProfileSyncError = vi.fn().mockImplementation((erroredNetworks: string[], retrySync) => {
			retrySync();
		});
		const onProfileSyncStart = vi.fn();

		const profile = env.profiles().findById(getMainsailProfileId());
		const profileSyncSpy = vi.spyOn(profile, "sync").mockImplementationOnce(() => {
			throw new Error("unknown");
		});

		const Component = () => {
			configuration = useConfiguration();
			useProfileSynchronizer({ onProfileSyncError, onProfileSyncStart });
			return <div data-testid="ProfileSyncedWithError">test</div>;
		};

		render(<Component />, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("ProfileSyncedWithError")).resolves.toBeVisible();

		const mockWalletSyncStatus = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

		await waitFor(() => {
			expect(configuration.getProfileConfiguration(profile.id()).profileIsSyncingWallets).toBe(false);
		});

		await renderAct(async () => {
			await configuration.setConfiguration(profile.id(), { profileIsSyncingWallets: true });
		});

		await waitFor(() => {
			expect(configuration.getProfileConfiguration(profile.id()).profileIsSyncingWallets).toBe(true);
		});

		mockWalletSyncStatus.mockRestore();
		profileSyncSpy.mockRestore();
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it("should restore profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		const profile = env.profiles().findById(getMainsailProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		await env.profiles().restore(profile);

		profile.settings().set(Contracts.ProfileSetting.AutomaticSignOutPeriod, 1);
		await env.persist();

		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		render(<div data-testid="ProfileRestored">test</div>);

		await expect(screen.findByTestId("ProfileRestored", undefined, { timeout: 4000 })).resolves.toBeVisible();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

		profileStatusMock.mockRestore();
		resetProfileNetworksMock();
		vi.clearAllTimers();
	});
});
