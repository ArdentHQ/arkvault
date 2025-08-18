/* eslint-disable @typescript-eslint/require-await */
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
	useProfileRestore,
	useProfileStatusWatcher,
	useProfileSynchronizer,
	useProfileSyncStatus,
} from "./use-profile-synchronizer";
import { useProfileJobs } from "@/app/hooks/use-profile-background-jobs";
import * as profileUtils from "@/utils/profile-utils";
import { ConfigurationProvider, EnvironmentProvider, useConfiguration } from "@/app/contexts";
import { toasts } from "@/app/services";
import {
	act as renderAct,
	env,
	getMainsailProfileId,
	render,
	screen,
	syncValidators,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	Providers,
	getDefaultProfileId,
} from "@/utils/testing-library";
import { beforeAll, vi } from "vitest";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const mainsailDevnet = "mainsail.devnet";

describe("useProfileSyncStatus", () => {
	it("should restore", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		const profile = env.profiles().findById(getMainsailProfileId());
		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(getMainsailProfileId()), { wrapper });

		expect(current.shouldRestore(profile)).toBe(true);

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

		profileStatusMock.mockRestore();
	});

	it("#idle", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getMainsailProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(getMainsailProfileId()), { wrapper });

		expect(current.isIdle()).toBe(true);
		expect(current.shouldRestore(profile)).toBe(false);
		expect(current.shouldSync()).toBe(true);
		expect(current.shouldMarkCompleted()).toBe(false);
	});

	it("#restoring", async () => {
		process.env.REACT_APP_IS_E2E = undefined;
		const profile = env.profiles().findById(getMainsailProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(getMainsailProfileId()), { wrapper });

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
		const profile = env.profiles().findById(getMainsailProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(getMainsailProfileId()), { wrapper });

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
		const profile = env.profiles().findById(getMainsailProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(getMainsailProfileId()), { wrapper });

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
		const profile = env.profiles().findById(getMainsailProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(getMainsailProfileId()), { wrapper });

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
		const profile = env.profiles().findById(getMainsailProfileId());

		const wrapper = ({ children }: any) => <ConfigurationProvider>{children}</ConfigurationProvider>;

		const {
			result: { current },
		} = renderHook(() => useProfileSyncStatus(getMainsailProfileId()), { wrapper });

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
		const profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		await syncValidators(profile);

		vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		vi.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it("should clear last profile sync jobs", async () => {
		const { navigate, router } = render(<div data-testid="ProfileSynced">test</div>, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		renderAct(() => {
			navigate("/");
		});

		await waitFor(() => expect(router.state.location.pathname).toBe("/"));
	});

	it("should not sync if not in profile's url", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		render(<div data-testid="RenderedContent">test</div>, {
			route: "/",
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("RenderedContent")).resolves.toBeVisible();

		vi.clearAllTimers();
	});

	it("should sync only valid profiles from url", async () => {
		render(<div data-testid="RenderedContent">test</div>, {
			route: "/profiles/invalidId/dashboard",
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("RenderedContent")).resolves.toBeVisible();
	});

	it("should restore profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		render(<div data-testid="ProfileRestored">test</div>, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("ProfileRestored")).resolves.toBeVisible();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
	});

	it("should handle restoration error for password protected profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		const passwordProtectedUrl = "/profiles/cba050f1-880f-45f0-9af9-cfe48f406052/dashboard";

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");
		profile.wallets().flush();

		const memoryPasswordMock = vi.spyOn(profile.password(), "get").mockImplementation(() => {
			throw new Error("password not found");
		});

		render(<div />, {
			route: passwordProtectedUrl,
			withProfileSynchronizer: true,
		});

		await waitFor(() => expect(profile.status().isRestored()).toBe(false));
		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
		memoryPasswordMock.mockRestore();
	});

	it("should restore profile and reset test password for e2e", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = "1";

		render(<div data-testid="ProfileRestored">test</div>, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("ProfileRestored")).resolves.toBeVisible();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
	});

	it("should not start syncing for empty profile", async () => {
		let configuration: any;
		const onProfileSyncStart = vi.fn();

		const emptyProfile = await env.profiles().create("empty profile");

		const dashboardURL = `/profiles/${emptyProfile.id()}/dashboard`;

		const Component = () => {
			configuration = useConfiguration();

			useProfileSynchronizer({
				onProfileSyncStart,
			});

			return <div data-testid="Dashboard">test</div>;
		};

		render(<Component />, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("Dashboard")).resolves.toBeVisible();

		await waitFor(() =>
			expect(configuration.getProfileConfiguration(emptyProfile.id()).profileHasSyncedOnce).toBe(true),
		);

		expect(onProfileSyncStart).not.toHaveBeenCalled();

		env.profiles().forget(emptyProfile.id());
	});

	it("should reset sync profile wallets", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		let configuration: any;

		const Component = () => {
			configuration = useConfiguration();
			const { syncProfileWallets } = useProfileJobs(profile);

			return <button data-testid="ResetSyncProfile" onClick={() => syncProfileWallets(true)} />;
		};

		render(<Component />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("ResetSyncProfile")).resolves.toBeVisible();

		await waitFor(() =>
			expect(configuration.getProfileConfiguration(getMainsailProfileId()).isProfileInitialSync).toBe(true),
		);
	});

	it("should sync profile", async () => {
		process.env.MOCK_SYNCHRONIZER = "TRUE";

		render(<div data-testid="ProfileSynced">test</div>, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		process.env.MOCK_SYNCHRONIZER = undefined;
	});

	it("should sync profile notifications for available wallets", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const profileNotificationsSyncSpy = vi.spyOn(profile.notifications().transactions(), "sync");

		const Component = () => {
			const { syncProfileWallets } = useProfileJobs(profile);

			return <button data-testid="SyncProfile" onClick={() => syncProfileWallets()} />;
		};

		render(<Component />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("SyncProfile")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SyncProfile"));

		await waitFor(() =>
			expect(profileNotificationsSyncSpy).toHaveBeenCalledWith({
				to: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6,0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54"
			}),
		);

		resetProfileNetworksMock();

		profileNotificationsSyncSpy.mockRestore();
	});

	it("should call on profile updated if new profile id", async () => {
		const onProfileUpdated = vi.fn();

		const profile = env.profiles().findById(getMainsailProfileId());
		const profile2 = await env.profiles().create("new profile 2");

		const dashboardURL = `/profiles/${profile.id()}/dashboard`;
		let navigate: (url: string) => Promise<void | undefined>;

		const url = `/profiles/${profile2.id()}/dashboard`;
		const changeUrl = () => {
			navigate(url);
		};

		const { navigate: routerNavigate, router } = render(
			<div data-testid="Test" onClick={changeUrl}>
				Press me
			</div>,
			{
				profileSynchronizerOptions: {
					onProfileUpdated,
				},
				route: dashboardURL,
				withProfileSynchronizer: true,
				withProviders: true,
			},
		);

		navigate = routerNavigate;

		await userEvent.click(screen.getByTestId("Test"));
		expect(router.state.location.pathname).toBe(url);
	});

	it("should not call on profile updated if profile id changes from dashboard", async () => {
		const onProfileUpdated = vi.fn();

		const profile = env.profiles().findById(getMainsailProfileId());

		const dashboardURL = `/profiles/${profile.id()}/dashboard`;

		let navigate: (url: string) => Promise<void | undefined>;
		const changeUrl = () => {
			navigate(dashboardURL);
		};

		const { navigate: routerNavigate } = render(
			<div data-testid="Test" onClick={changeUrl}>
				Press me
			</div>,
			{
				route: "/",
				withProfileSynchronizer: false,
			},
		);

		navigate = routerNavigate;

		await expect(screen.findByTestId("Test")).resolves.toBeVisible();

		expect(onProfileUpdated).not.toHaveBeenCalled();
	});
});

describe("useProfileRestore", () => {
	const wrapper = ({ children }: any) => <Providers> {children} </Providers>;

	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
	});

	it("should not restore profile if already restored in tests", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
		const profile = env.profiles().findById(getMainsailProfileId());

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(profile.id()), { wrapper });

		await expect(current.restoreProfile(profile)).resolves.toBe(false);

		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
	});

	it.skip("should restore and save profile", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		const profile = env.profiles().findById(getMainsailProfileId());
		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);
		profile.wallets().flush();

		const profileFromUrlMock = vi.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue(profile);
		const passwordMock = vi.spyOn(profileUtils, "getProfileStoredPassword").mockImplementation(() => void 0);

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(profile.id()), { wrapper });

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

	it.skip("should restore a profile that uses password", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");
		const profileStatusMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const profileFromUrlMock = vi.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue(profile);
		const passwordMock = vi.spyOn(profileUtils, "getProfileStoredPassword").mockReturnValue("password");

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(profile.id()), { wrapper });

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
		const profile = await env.profiles().create("test profile");

		const profileFromUrlMock = vi.spyOn(profileUtils, "getProfileFromUrl").mockReturnValue({ id: () => "1" });
		const passwordMock = vi.spyOn(profileUtils, "getProfileStoredPassword").mockReturnValue({});

		const {
			result: { current },
		} = renderHook(() => useProfileRestore("1"), { wrapper });

		let isRestored: boolean | undefined;

		await act(async () => {
			isRestored = await current.restoreProfile(profile);
		});

		expect(isRestored).toBeFalsy();

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";

		profileFromUrlMock.mockRestore();
		passwordMock.mockRestore();
		env.profiles().forget(profile.id());
	});

	it("should restore only once", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_E2E = undefined;

		const profile = env.profiles().findById(getMainsailProfileId());
		profile.wallets().flush();

		const {
			result: { current },
		} = renderHook(() => useProfileRestore(profile.id()), { wrapper });

		let isRestored: boolean | undefined;

		await act(async () => {
			isRestored = await current.restoreProfile(profile);
		});

		expect(isRestored).toBe(false);

		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
	});

	// TODO: fix.
	it.skip("should sync profile and handle sync error", async () => {
		const dismissToastSpy = vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());

		const profile = env.profiles().findById(getDefaultProfileId());

		const profileSyncMock = vi.spyOn(profile, "sync").mockImplementation(() => {
			throw new Error("sync test");
		});

		render(<div />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		//await profile.sync();

		await waitFor(() => expect(profileSyncMock).toHaveBeenCalled(), { timeout: 5000 });

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
		const profile = env.profiles().findById(getMainsailProfileId());

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
		const profile = env.profiles().findById(getMainsailProfileId());

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
		const profile = env.profiles().findById(getMainsailProfileId());
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

		const profile = env.profiles().findById(getMainsailProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		await env.profiles().restore(profile);
		const wallet = profile.wallets().first();
		const mockWalletSyncStatus = vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);

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
		const profile = env.profiles().findById(getMainsailProfileId());

		const wrapper = ({ children }: any) => <Providers>{children}</Providers>;

		const setState = vi.fn();
		const useStateSpy = vi.spyOn(React, "useState");
		//@ts-ignore
		useStateSpy.mockImplementation((initialState, setActualState) => {
			// Use actual state if it's not `isInitialSync` in useProfileStatusWatcher
			if (initialState !== true) {
				return [initialState, setActualState];
			}

			if (initialState.profileErroredNetworks) {
				return [{ ...initialState, profileErroredNetworks: ["Mainsail Devnet"] }, setActualState];
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
		const profile = env.profiles().findById(getMainsailProfileId());

		vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;
		process.env.REACT_APP_IS_UNIT = undefined;

		profile.wallets().flush();

		const ledgerWallet = await profile.walletFactory().fromAddressWithDerivationPath({
			address: "0x393f3F74F0cd9e790B5192789F31E0A38159ae03",
			coin: "Mainsail",
			network: mainsailDevnet,
			path: "m/44'/1'/0'/0/3",
		});

		profile.wallets().push(ledgerWallet);

		const onLedgerCompatibilityError = vi.fn();

		const Component = () => {
			useProfileSynchronizer({
				onLedgerCompatibilityError,
			});

			return <div data-testid="ProfileSynced">test</div>;
		};

		render(<Component />, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("ProfileSynced")).resolves.toBeVisible();

		await waitFor(() => {
			expect(onLedgerCompatibilityError).toHaveBeenCalledTimes(1);
		});

		vi.restoreAllMocks();
	});
});
