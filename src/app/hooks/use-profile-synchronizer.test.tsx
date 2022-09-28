/* eslint-disable @typescript-eslint/require-await */
import { act, renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import {
	useProfileJobs,
	useProfileRestore,
	useProfileStatusWatcher,
	useProfileSynchronizer,
	useProfileSyncStatus,
} from "./use-profile-synchronizer";
import * as profileUtils from "@/utils/profile-utils";
import { ConfigurationProvider, EnvironmentProvider, useConfiguration } from "@/app/contexts";
import { toasts } from "@/app/services";
import {
	act as renderAct,
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	syncDelegates,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

jest.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("useProfileSyncStatus", () => {
	it("should restore", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());
		const profileStatusMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(), { wrapper });

		expect(current.shouldRestore(profile)).toBe(true);

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

		profileStatusMock.mockRestore();
	});

	it("#idle", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(), { wrapper });

		expect(current.isIdle()).toBe(true);
		expect(current.shouldRestore(profile)).toBe(false);
		expect(current.shouldSync()).toBe(true);
		expect(current.shouldMarkCompleted()).toBe(false);
	});

	it("#restoring", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(), { wrapper });

		act(() => {
			current.setStatus("restoring");
		});

		expect(current.isIdle()).toBe(false);
		expect(current.shouldRestore(profile)).toBe(false);
		expect(current.shouldSync()).toBe(false);
		expect(current.shouldMarkCompleted()).toBe(false);
	});

	it("#restored", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(), { wrapper });

		act(() => {
			current.markAsRestored(profile.id());
		});

		expect(current.isIdle()).toBe(false);
		expect(current.shouldRestore(profile)).toBe(false);
		expect(current.shouldSync()).toBe(true);
		expect(current.shouldMarkCompleted()).toBe(false);
	});

	it("#syncing", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(), { wrapper });

		act(() => {
			current.setStatus("idle");
			current.setStatus("syncing");
		});

		expect(current.isIdle()).toBe(false);
		expect(current.shouldRestore(profile)).toBe(false);
		expect(current.shouldSync()).toBe(false);
		expect(current.shouldMarkCompleted()).toBe(false);
	});

	it("#synced", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(), { wrapper });

		act(() => {
			current.setStatus("synced");
		});

		expect(current.isIdle()).toBe(false);
		expect(current.shouldRestore(profile)).toBe(false);
		expect(current.shouldSync()).toBe(false);
		expect(current.shouldMarkCompleted()).toBe(true);
	});

	it("#completed", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(), { wrapper });

		act(() => {
			current.setStatus("completed");
		});

		expect(current.isIdle()).toBe(false);
		expect(current.shouldRestore(profile)).toBe(false);
		expect(current.shouldSync()).toBe(false);
		expect(current.shouldMarkCompleted()).toBe(false);
	});
});

describe("useProfileSynchronizer", () => {
	beforeEach(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		await syncDelegates(profile);

		jest.spyOn(toasts, "success").mockImplementation();
		jest.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	it("should clear last profile sync jobs", async () => {
		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="ProfileSynced">test</div>
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		renderAct(() => {
			history.push("/");
		});

		await waitFor(() => expect(history.location.pathname).toBe("/"));
		await waitFor(() => expect(screen.queryByTestId("ProfileSynced")).not.toBeInTheDocument(), { timeout: 5000 });
	});

	it("should not sync if not in profile's url", async () => {
		history.push("/");

		jest.useFakeTimers();
		render(
			<Route path="/">
				<div data-testid="RenderedContent">test</div>
			</Route>,
			{
				history,
				route: "/",
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("RenderedContent")).resolves.toBeVisible();

		jest.clearAllTimers();
	});

	it("should sync only valid profiles from url", async () => {
		history.push("/profiles/invalidId/dashboard");

		render(
			<Route path="/">
				<div data-testid="RenderedContent">test</div>
			</Route>,
			{
				history,
				route: "/profiles/:profileId/dashboard",
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("RenderedContent")).resolves.toBeVisible();
	});

	it("should restore profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="ProfileRestored">test</div>
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("ProfileRestored")).resolves.toBeVisible();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
	});

	it("should handle restoration error for password protected profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;

		const passwordProtectedUrl = "/profiles/cba050f1-880f-45f0-9af9-cfe48f406052/dashboard";
		history.push(passwordProtectedUrl);

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");
		profile.wallets().flush();

		const memoryPasswordMock = jest.spyOn(profile.password(), "get").mockImplementation(() => {
			throw new Error("password not found");
		});

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="Content">test</div>
			</Route>,
			{
				history,
				route: passwordProtectedUrl,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("Content")).not.toBeInTheDocument());
		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
		memoryPasswordMock.mockRestore();
	});

	it("should restore profile and reset test password for e2e", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = "1";

		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="ProfileRestored">test</div>
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("ProfileRestored")).resolves.toBeVisible();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
	});

	it("should not start syncing for empty profile", async () => {
		let configuration: any;
		const onProfileSyncStart = jest.fn();

		const emptyProfile = await env.profiles().create("empty profile");

		const dashboardURL = `/profiles/${emptyProfile.id()}/dashboard`;
		history.push(dashboardURL);

		const Component = () => {
			configuration = useConfiguration();

			useProfileSynchronizer({
				onProfileSyncStart,
			});

			return <div data-testid="Dashboard">test</div>;
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

		await expect(screen.findByTestId("Dashboard")).resolves.toBeVisible();

		await waitFor(() => expect(configuration.profileHasSyncedOnce).toBe(true));

		expect(onProfileSyncStart).not.toHaveBeenCalled();
	});

	it("should reset sync profile wallets", async () => {
		history.push(dashboardURL);

		const profile = env.profiles().findById(getDefaultProfileId());
		let configuration: any;

		const Component = () => {
			configuration = useConfiguration();
			const { syncProfileWallets } = useProfileJobs(profile);

			return <button data-testid="ResetSyncProfile" onClick={() => syncProfileWallets(true)} />;
		};

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Component />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("ResetSyncProfile")).resolves.toBeVisible();

		await waitFor(() => expect(configuration.isProfileInitialSync).toBe(false));

		userEvent.click(screen.getByTestId("ResetSyncProfile"));

		await waitFor(() => expect(configuration.isProfileInitialSync).toBe(true));
	});

	it("should sync profile", async () => {
		process.env.MOCK_SYNCHRONIZER = "TRUE";
		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="ProfileSynced">test</div>
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		process.env.MOCK_SYNCHRONIZER = undefined;
	});

	it("should sync profile notifications for available wallets", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const profileNotificationsSyncSpy = jest.spyOn(profile.notifications().transactions(), "sync");

		const Component = () => {
			const { syncProfileWallets } = useProfileJobs(profile);

			return <button data-testid="SyncProfile" onClick={() => syncProfileWallets()} />;
		};

		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Component />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("SyncProfile")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SyncProfile"));

		await waitFor(() =>
			expect(profileNotificationsSyncSpy).toHaveBeenCalledWith({
				identifiers: [
					{ networkId: "ark.devnet", type: "address", value: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
					{ networkId: "ark.devnet", type: "address", value: "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb" },
				],
			}),
		);

		resetProfileNetworksMock();

		profileNotificationsSyncSpy.mockRestore();
	});

	it("should sync profile and handle resync with errored networks", async () => {
		jest.useFakeTimers();
		history.push(dashboardURL);

		let configuration: any;
		let profileErroredNetworks: string[] = [];

		const onProfileSyncError = jest.fn().mockImplementation((erroredNetworks: string[], retrySync) => {
			profileErroredNetworks = erroredNetworks;
			retrySync();
		});
		const onProfileSyncStart = jest.fn();

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

		const mockWalletSyncStatus = jest
			.spyOn(profile.wallets().first(), "hasBeenFullyRestored")
			.mockReturnValue(false);

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

		jest.useRealTimers();
		jest.clearAllTimers();
	});

	it("should sync profile and handle resync with sync error", async () => {
		jest.useFakeTimers();

		history.push(dashboardURL);
		let configuration: any;

		const onProfileSyncError = jest.fn().mockImplementation((erroredNetworks: string[], retrySync) => {
			retrySync();
		});
		const onProfileSyncStart = jest.fn();

		const profile = env.profiles().findById(getDefaultProfileId());
		const profileSyncSpy = jest.spyOn(profile, "sync").mockImplementationOnce(() => {
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

		const mockWalletSyncStatus = jest
			.spyOn(profile.wallets().first(), "hasBeenFullyRestored")
			.mockReturnValue(false);

		await renderAct(async () => {
			configuration.setConfiguration({ profileIsSyncingWallets: true });
		});

		await waitFor(() => expect(configuration.profileIsSyncingWallets).toBe(true));

		mockWalletSyncStatus.mockRestore();
		profileSyncSpy.mockRestore();
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	it("should call on profile updated if new profile id", async () => {
		const onProfileUpdated = jest.fn();

		const profile = env.profiles().findById(getDefaultProfileId());
		const profile2 = await env.profiles().create("new profile 2");

		const dashboardURL = `/profiles/${profile.id()}/dashboard`;
		history.push(dashboardURL);

		const changeUrl = () => {
			history.push(`/profiles/${profile2.id()}/dashboard`);
		};

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="Test" onClick={changeUrl}>
					Press me
				</div>
			</Route>,
			{
				history,
				profileSynchronizerOptions: {
					onProfileUpdated,
				},
				route: dashboardURL,
				withProfileSynchronizer: true,
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("Test")).resolves.toBeVisible();

		expect(onProfileUpdated).not.toHaveBeenCalled();

		userEvent.click(screen.getByTestId("Test"));

		expect(onProfileUpdated).toHaveBeenCalledWith();
	});

	it("should not call on profile updated if profile id changes from dashboard", async () => {
		const onProfileUpdated = jest.fn();

		const profile = env.profiles().findById(getDefaultProfileId());

		const dashboardURL = `/profiles/${profile.id()}/dashboard`;
		history.push("/");

		const changeUrl = () => {
			history.push(dashboardURL);
		};

		render(
			<Route path="/">
				<div data-testid="Test" onClick={changeUrl}>
					Press me
				</div>
			</Route>,
			{
				history,
				route: "/",
				withProfileSynchronizer: false,
			},
		);

		await expect(screen.findByTestId("Test")).resolves.toBeVisible();

		expect(onProfileUpdated).not.toHaveBeenCalled();

		userEvent.click(screen.getByTestId("Test"));

		expect(onProfileUpdated).not.toHaveBeenCalled();
	});
});

describe("useProfileRestore", () => {
	it("should not restore profile if already restored in tests", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		await expect(current.restoreProfile(profile)).resolves.toBe(false);

		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
	});

	it("should restore and save profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());
		const profileStatusMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);
		profile.wallets().flush();

		const profileFromUrlMock = jest.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue(profile);
		const passwordMock = jest.spyOn(profileUtils, "getProfileStoredPassword").mockImplementation(() => void 0);

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		let isRestored: boolean;

		await act(async () => {
			isRestored = await current.restoreProfile(profile);
		});

		expect(isRestored).toBe(true);

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
		profileFromUrlMock.mockRestore();
		passwordMock.mockRestore();
		profileStatusMock.mockRestore();
	});

	it("should restore a profile that uses password", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");
		const profileStatusMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const profileFromUrlMock = jest.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue(profile);
		const passwordMock = jest.spyOn(profileUtils, "getProfileStoredPassword").mockReturnValue("password");

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		let isRestored: boolean;

		await act(async () => {
			isRestored = await current.restoreProfile(profile, "password");
		});

		expect(isRestored).toBe(true);

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
		profileFromUrlMock.mockRestore();
		passwordMock.mockRestore();
		profileStatusMock.mockRestore();
	});

	it("should not restore if url doesn't match active profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());
		profile.status().reset();
		profile.wallets().flush();

		const profileFromUrlMock = jest.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue({ id: () => "1" });
		const passwordMock = jest.spyOn(profileUtils, "getProfileStoredPassword").mockReturnValue({});

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		let isRestored: boolean;

		await act(async () => {
			isRestored = await current.restoreProfile(profile);
		});

		expect(isRestored).toBeFalsy();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

		profileFromUrlMock.mockRestore();
		passwordMock.mockRestore();
	});

	it("should restore only once", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		const profile = env.profiles().findById(getDefaultProfileId());
		profile.wallets().flush();

		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider defaultConfiguration={{ restoredProfiles: [profile.id()] }}>
					{children}
				</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		let isRestored: boolean;

		await act(async () => {
			isRestored = await current.restoreProfile(profile);
		});

		expect(isRestored).toBe(false);

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
	});

	it("should sync profile and handle sync error", async () => {
		const dismissToastSpy = jest.spyOn(toasts, "dismiss").mockImplementation();
		history.push(dashboardURL);

		const profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		profile.wallets().push(
			await profile.walletFactory().fromMnemonicWithBIP39({
				coin: "ARK",
				mnemonic: MNEMONICS[0],
				network: "ark.devnet",
			}),
		);

		profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
				coin: "ARK",
				network: "ark.mainnet",
			}),
		);

		const profileSyncMock = jest.spyOn(profile, "sync").mockImplementation(() => {
			throw new Error("sync test");
		});

		render(
			<Route path="/profiles/:profileId/dashboard">
				<div data-testid="ProfileSynced">test</div>
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => expect(profileSyncMock).toHaveBeenCalledWith());

		profileSyncMock.mockRestore();
		dismissToastSpy.mockRestore();
	});

	it("should restore profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		const profile = await env.profiles().create("new profile");
		await env.profiles().restore(profile);

		profile.settings().set(Contracts.ProfileSetting.AutomaticSignOutPeriod, 1);
		await env.persist();

		const profileStatusMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);

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

		const historyMock = jest.spyOn(history, "push").mockReturnValue();

		await expect(screen.findByTestId("ProfileRestored", undefined, { timeout: 4000 })).resolves.toBeVisible();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

		profileStatusMock.mockRestore();
		historyMock.mockRestore();
		jest.clearAllTimers();
	});
});

describe("useProfileStatusWatcher", () => {
	it("should not monitor for network status if profile is undefined", async () => {
		const onProfileSyncComplete = jest.fn();
		const onProfileSyncError = jest.fn();

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		renderHook(
			() => useProfileStatusWatcher({ env, onProfileSyncComplete, onProfileSyncError, profile: undefined }),
			{
				wrapper,
			},
		);

		expect(onProfileSyncComplete).not.toHaveBeenCalled();
		expect(onProfileSyncError).not.toHaveBeenCalled();
	});

	it("should not monitor for network status if profile has not finished syncing", async () => {
		const onProfileSyncComplete = jest.fn();
		const onProfileSyncError = jest.fn();
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider
					defaultConfiguration={{ profileHasSynced: false, profileIsSyncingWallets: false }}
				>
					{children}
				</ConfigurationProvider>
			</EnvironmentProvider>
		);

		renderHook(() => useProfileStatusWatcher({ env, onProfileSyncComplete, onProfileSyncError, profile }), {
			wrapper,
		});

		expect(onProfileSyncComplete).not.toHaveBeenCalled();
		expect(onProfileSyncError).not.toHaveBeenCalled();
	});

	it("should not monitor for network status if profile is still syncing wallets", async () => {
		const onProfileSyncComplete = jest.fn();
		const onProfileSyncError = jest.fn();
		const profile = env.profiles().findById(getDefaultProfileId());

		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider defaultConfiguration={{ profileHasSynced: true, profileIsSyncingWallets: true }}>
					{children}
				</ConfigurationProvider>
			</EnvironmentProvider>
		);

		renderHook(() => useProfileStatusWatcher({ env, onProfileSyncComplete, onProfileSyncError, profile }), {
			wrapper,
		});

		expect(onProfileSyncComplete).not.toHaveBeenCalled();
		expect(onProfileSyncError).not.toHaveBeenCalled();
	});

	it("should not monitor for network status if profile has no wallets", async () => {
		const onProfileSyncComplete = jest.fn();
		const onProfileSyncError = jest.fn();
		const profile = env.profiles().findById(getDefaultProfileId());
		const walletCountMock = jest.spyOn(profile.wallets(), "count").mockReturnValue(0);

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		renderHook(() => useProfileStatusWatcher({ env, onProfileSyncComplete, onProfileSyncError, profile }), {
			wrapper,
		});

		expect(onProfileSyncComplete).not.toHaveBeenCalled();
		expect(onProfileSyncError).not.toHaveBeenCalled();

		walletCountMock.mockRestore();
	});

	it("should trigger sync error callback if profile has errored wallet networks", async () => {
		const onProfileSyncComplete = jest.fn();
		const onProfileSyncError = jest.fn();

		const profile = env.profiles().findById(getDefaultProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const mockWalletSyncStatus = jest
			.spyOn(profile.wallets().first(), "hasBeenFullyRestored")
			.mockReturnValue(false);

		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider
					defaultConfiguration={{
						profileHasSynced: true,
						profileHasSyncedOnce: true,
						profileIsSyncingWallets: false,
					}}
				>
					{children}
				</ConfigurationProvider>
			</EnvironmentProvider>
		);

		renderHook(() => useProfileStatusWatcher({ env, onProfileSyncComplete, onProfileSyncError, profile }), {
			wrapper,
		});

		expect(onProfileSyncComplete).not.toHaveBeenCalled();
		expect(onProfileSyncError).toHaveBeenCalledWith(
			expect.arrayContaining([expect.any(String)]),
			expect.any(Function),
		);

		mockWalletSyncStatus.mockRestore();
		resetProfileNetworksMock();
	});

	it("should stay idle if network status has not changed", async () => {
		const onProfileSyncComplete = jest.fn();
		const onProfileSyncError = jest.fn();
		const profile = env.profiles().findById(getDefaultProfileId());

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider
					defaultConfiguration={{
						isProfileInitialSync: false,
						profileHasSynced: true,
						profileHasSyncedOnce: true,
						profileIsSyncingWallets: false,
					}}
				>
					{children}
				</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const setState = jest.fn();
		const useStateSpy = jest.spyOn(React, "useState");
		//@ts-ignore
		useStateSpy.mockImplementation((initialState, setActualState) => {
			// Use actual state if it's not `isInitialSync` in useProfileStatusWatcher
			if (initialState !== true) {
				return [initialState, setActualState];
			}

			if (initialState.profileErroredNetworks) {
				return [{ ...initialState, profileErroredNetworks: ["ARK Devnet"] }, setActualState];
			}

			// Mock `isInitialSync` as false for idle state
			return [false, setState];
		});

		renderHook(
			() =>
				useProfileStatusWatcher({
					env,
					onProfileSyncComplete,
					onProfileSyncError,
					profile,
				}),
			{
				wrapper,
			},
		);

		useStateSpy.mockRestore();

		expect(onProfileSyncComplete).not.toHaveBeenCalled();
		expect(onProfileSyncError).not.toHaveBeenCalled();
	});
});
