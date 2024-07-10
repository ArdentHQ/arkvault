/* eslint-disable @typescript-eslint/require-await */
import { act, renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

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

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("useProfileSyncStatus", () => {
	it("should restore", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());
		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);

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

		vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		vi.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it("should clear last profile sync jobs", async () => {
		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard" element={<div data-testid="ProfileSynced">test</div>} />,
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

		vi.useFakeTimers();
		render(
			<Route path="/" element={<div data-testid="RenderedContent">test</div>} />,
			{
				history,
				route: "/",
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("RenderedContent")).resolves.toBeVisible();

		vi.clearAllTimers();
	});

	it("should sync only valid profiles from url", async () => {
		history.push("/profiles/invalidId/dashboard");

		render(
			<Route path="/" element={<div data-testid="RenderedContent">test</div>} />,
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
			<Route path="/profiles/:profileId/dashboard" element={<div data-testid="ProfileRestored">test</div>} />,
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

		const memoryPasswordMock = vi.spyOn(profile.password(), "get").mockImplementation(() => {
			throw new Error("password not found");
		});

		render(
			<Route path="/profiles/:profileId/dashboard" element={<div data-testid="Content">test</div>} />,
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
			<Route path="/profiles/:profileId/dashboard" element={<div data-testid="ProfileRestored">test</div>} />,
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
		const onProfileSyncStart = vi.fn();

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
			<Route path="/profiles/:profileId/dashboard" element={<Component/>}/>,
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
			<Route path="/profiles/:profileId/dashboard" element={<Component/>}/>,
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
			<Route path="/profiles/:profileId/dashboard" element={<div data-testid="ProfileSynced">test</div>}>
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

		const profileNotificationsSyncSpy = vi.spyOn(profile.notifications().transactions(), "sync");

		const Component = () => {
			const { syncProfileWallets } = useProfileJobs(profile);

			return <button data-testid="SyncProfile" onClick={() => syncProfileWallets()} />;
		};

		history.push(dashboardURL);

		render(
			<Route path="/profiles/:profileId/dashboard" element={<Component/>}/>,
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

	it("should call on profile updated if new profile id", async () => {
		const onProfileUpdated = vi.fn();

		const profile = env.profiles().findById(getDefaultProfileId());
		const profile2 = await env.profiles().create("new profile 2");

		const dashboardURL = `/profiles/${profile.id()}/dashboard`;
		history.push(dashboardURL);

		const changeUrl = () => {
			history.push(`/profiles/${profile2.id()}/dashboard`);
		};

		render(
			<Route path="/profiles/:profileId/dashboard" element={<div data-testid="Test" onClick={changeUrl}>
				Press me
			</div>}>

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
		const onProfileUpdated = vi.fn();

		const profile = env.profiles().findById(getDefaultProfileId());

		const dashboardURL = `/profiles/${profile.id()}/dashboard`;
		history.push("/");

		const changeUrl = () => {
			history.push(dashboardURL);
		};

		render(
			<Route path="/" element={<div data-testid="Test" onClick={changeUrl}>
				Press me
			</div>} />,
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
		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);
		profile.wallets().flush();

		const profileFromUrlMock = vi.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue(profile);
		const passwordMock = vi.spyOn(profileUtils, "getProfileStoredPassword").mockImplementation(() => void 0);

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		let isRestored: boolean | undefined;

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
		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const profileFromUrlMock = vi.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue(profile);
		const passwordMock = vi.spyOn(profileUtils, "getProfileStoredPassword").mockReturnValue("password");

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		let isRestored: boolean | undefined;

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

		const profileFromUrlMock = vi.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue({ id: () => "1" });
		const passwordMock = vi.spyOn(profileUtils, "getProfileStoredPassword").mockReturnValue({});

		// eslint-disable-next-line sonarjs/no-identical-functions
		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(), { wrapper });

		let isRestored: boolean | undefined;

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

		let isRestored: boolean | undefined;

		await act(async () => {
			isRestored = await current.restoreProfile(profile);
		});

		expect(isRestored).toBe(false);

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
	});

	it("should sync profile and handle sync error", async () => {
		const dismissToastSpy = vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());
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

		const profileSyncMock = vi.spyOn(profile, "sync").mockImplementation(() => {
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
});

describe("useProfileStatusWatcher", () => {
	it("should not monitor for network status if profile is undefined", async () => {
		const onProfileSyncComplete = vi.fn();
		const onProfileSyncError = vi.fn();

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
		const onProfileSyncComplete = vi.fn();
		const onProfileSyncError = vi.fn();
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
		const onProfileSyncComplete = vi.fn();
		const onProfileSyncError = vi.fn();
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
		const onProfileSyncComplete = vi.fn();
		const onProfileSyncError = vi.fn();
		const profile = env.profiles().findById(getDefaultProfileId());
		const walletCountMock = vi.spyOn(profile.wallets(), "count").mockReturnValue(0);

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
		const onProfileSyncComplete = vi.fn();
		const onProfileSyncError = vi.fn();

		const profile = env.profiles().findById(getDefaultProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const mockWalletSyncStatus = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

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
		const onProfileSyncComplete = vi.fn();
		const onProfileSyncError = vi.fn();
		const profile = env.profiles().findById(getDefaultProfileId());


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

		const setState = vi.fn();
		const useStateSpy = vi.spyOn(React, "useState");
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

	it("should emit error for incompatible ledger wallets", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_UNIT = undefined;

		const ledgerWallet = await profile.walletFactory().fromAddressWithDerivationPath({
			address: "FwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
			coin: "ARK",
			network: "ark.devnet",
			path: "m/44'/1'/0'/0/3",
		});

		profile.wallets().push(ledgerWallet);

		history.push(dashboardURL);

		const onLedgerCompatibilityError = vi.fn();

		const Component = () => {
			useProfileSynchronizer({
				onLedgerCompatibilityError,
			});

			return <div data-testid="ProfileSynced">test</div>;
		};

		render(
			<Route path="/profiles/:profileId/dashboard" element={<Component/>}/>,
			{
				history,
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		await waitFor(() => {
			expect(onLedgerCompatibilityError).toHaveBeenCalledTimes(1);
		});

		vi.restoreAllMocks();
	});
});
