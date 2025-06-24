import {
	act,
	env,
	getDefaultPassword,
	getMainsailProfileId,
	getPasswordProtectedProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { afterAll, vi } from "vitest";
import { httpClient, toasts } from "@/app/services";

import { Contracts } from "@/app/lib/profiles";
import { EnvironmentProvider } from "@/app/contexts";
import { ProfilePaths } from "@/router/paths";
import React from "react";
import { StubStorage } from "@/tests/mocks";
import { Welcome } from "./Welcome";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import { renderHook } from "@testing-library/react";
import { truncate } from "@/app/lib/helpers";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";
import userEvent from "@testing-library/user-event";

const fixtureProfileId = getMainsailProfileId();
const mockedProfileId = "cba050f1-880f-45f0-9af9-cfe48f406052";

const submitTestID = "SignIn__submit-button";
const passwordTestID = "SignIn__input--password";

const submitPassword = async () => {
	await userEvent.type(screen.getByTestId(passwordTestID), "password");

	await waitFor(() => {
		expect(screen.getByTestId(passwordTestID)).toHaveValue("password");
	});

	await waitFor(() => {
		expect(screen.getByTestId(submitTestID)).toBeEnabled();
	});

	await userEvent.click(screen.getByTestId(submitTestID));
};

let toastUpdateSpy: vi.SpyInstance;

const expectToast = async (text: string) => {
	await waitFor(() => expect(toastUpdateSpy).toHaveBeenCalledWith(expect.any(String), "error", text));
};

describe("Welcome with deeplink", () => {
	const mainnetDeepLink =
		"/?method=transfer&coin=Mainsail&network=mainsail.mainnet&recipient=0x125b484e51Ad990b5b3140931f3BD8eAee85Db23&amount=1.2&memo=ARK";

	let resetProfileNetworksMock: () => void;
	let profile: Contracts.IProfile;

	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(fixtureProfileId);
	});

	beforeEach(() => {
		toastUpdateSpy = vi.spyOn(toasts, "update").mockImplementation(vi.fn());

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		toastUpdateSpy.mockRestore();

		resetProfileNetworksMock();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should redirect to password protected profile if only one available", async () => {
		const passwordProtectedProfile = env.profiles().findById(getPasswordProtectedProfileId());

		const mockPasswordGetter = vi
			.spyOn(passwordProtectedProfile.password(), "get")
			.mockReturnValue(getDefaultPassword());

		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const profilesSpy = vi.spyOn(env, "profiles").mockImplementationOnce(() => ({
			findById: () => passwordProtectedProfile,
			values: () => [passwordProtectedProfile],
		}));

		render(<Welcome />, {
			route: "/?method=transfer&coin=mainsail&nethash=c481dea3dcc13708364e576dff94dd499692b56cbc646d5acd22a3902297dd51",
		});

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await submitPassword();

		await waitFor(() => expect(mockPasswordGetter).toHaveBeenCalledWith());
		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));

		mockPasswordGetter.mockRestore();
		toastWarningSpy.mockRestore();
		profilesSpy.mockRestore();
	});

	it("should navigate to vote page", async () => {
		const mockValidatorName = vi
			.spyOn(profile.validators(), "findByUsername")
			.mockReturnValue(profile.wallets().first());
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const route =
			"?method=vote&coin=Mainsail&nethash=c481dea3dcc13708364e576dff94dd499692b56cbc646d5acd22a3902297dd51&validator=test&vote=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6";

		const { router } = render(<Welcome />, {
			route,
		});

		await waitFor(() => expect(screen.getAllByTestId("ProfileRow")).toHaveLength(2));

		await waitFor(() =>
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 }),
		);
		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[0]);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));

		// Assert navigation using router state
		await waitFor(() => {
			expect(router.state.location.search).toBe(route);
		});

		toastWarningSpy.mockRestore();
		mockValidatorName.mockRestore();
	});

	it("should navigate to verify message page", async () => {
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const route =
			"?method=verify&coin=mainsail&network=mainsail.devnet&message=hello+world&signatory=signatory&signature=signature";
		const { router } = render(<Welcome />, { route });

		await waitFor(() => expect(screen.getAllByTestId("ProfileRow")).toHaveLength(2));

		await waitFor(() =>
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 }),
		);
		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[0]);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));

		await waitFor(() =>
			expect(router.state.location.pathname).toBe(`/profiles/${fixtureProfileId}/verify-message`),
		);
		await waitFor(() => expect(router.state.location.search).toBe(route));

		toastWarningSpy.mockRestore();
	});

	//@TODO: Fix this test - No content is being rendered on the welcome page
	/* it("should use entered password when using deeplink for a password protected profile", async () => {
		const passwordProtectedProfile = env.profiles().findById(getPasswordProtectedProfileId());
		const mockPasswordGetter = vi
			.spyOn(passwordProtectedProfile.password(), "get")
			.mockReturnValue(getDefaultPassword());

		const mockDelegateName = vi.spyOn(profile.validators(), "findByUsername").mockReturnValue(profile.wallets().first());

		render(
				<Welcome />,
			{
				route: "/?method=vote&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&delegate=test",
			},
		);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByText(passwordProtectedProfile.name()));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await act(async () => {
			await submitPassword();
		});

		await waitFor(() => expect(mockPasswordGetter).toHaveBeenCalledWith());

		mockDelegateName.mockRestore();
		mockPasswordGetter.mockRestore();
	}); */

	it("should ignore multiple clicks", async () => {
		const { container } = render(<Welcome />, {
			route: "/?method=transfer&coin=ark",
		});

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await waitFor(() =>
			expect(toastUpdateSpy).toHaveBeenNthCalledWith(
				1,
				expect.any(String),
				"error",
				result.current.buildSearchParametersError({ type: "MISSING_NETWORK_OR_NETHASH", value: "DOGE" }),
			),
		);
	});

	it("should show a warning if the method is not supported", async () => {
		const { container } = render(<Welcome />, {
			route: "/?method=nuke&coin=mainsail&network=mainsail.mainnet",
		});

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "METHOD_NOT_SUPPORTED", value: "nuke" }));
	});

	it("should show a warning if the network and nethash are both missing", async () => {
		const { container } = render(<Welcome />, {
			route: "/?method=transfer&coin=mainsail",
		});

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "MISSING_NETWORK_OR_NETHASH" }));
	});

	it("should show a warning if the network parameter is invalid", async () => {
		const { container } = render(<Welcome />, {
			route: "/?method=transfer&coin=mainsail&network=custom",
		});

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "NETWORK_INVALID", value: "custom" }));
	});

	it("should show a warning if there is no network for the given nethash", async () => {
		const nethash = "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8987";
		const { container } = render(<Welcome />, {
			route: `/?method=transfer&coin=mainsail&nethash=${nethash}`,
		});

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		const truncated = truncate(nethash, {
			length: 20,
			omissionPosition: "middle",
		});

		await expectToast(result.current.buildSearchParametersError({ type: "NETHASH_NOT_ENABLED", value: truncated }));
	});

	it("should navigate to transfer page with network parameter", async () => {
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const route = "?method=transfer&coin=mainsail&network=mainsail.devnet";

		const { router } = render(<Welcome />, {
			route,
		});

		await waitFor(() => expect(screen.getAllByTestId("ProfileRow")).toHaveLength(2));

		await waitFor(() =>
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 }),
		);
		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[0]);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));
		await waitFor(() => expect(router.state.location.pathname).toBe(`/profiles/${fixtureProfileId}/send-transfer`));
		await waitFor(() => expect(router.state.location.search).toBe(route));

		toastWarningSpy.mockRestore();
	});

	it("should navigate to transfer page with nethash parameter", async () => {
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const route =
			"?method=transfer&coin=mainsail&nethash=c481dea3dcc13708364e576dff94dd499692b56cbc646d5acd22a3902297dd51";

		const { router } = render(<Welcome />, {
			route,
		});

		await waitFor(() => expect(screen.getAllByTestId("ProfileRow")).toHaveLength(2));

		await waitFor(() =>
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 }),
		);
		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[0]);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));
		await waitFor(() => expect(router.state.location.pathname).toBe(`/profiles/${fixtureProfileId}/send-transfer`));
		await waitFor(() => expect(router.state.location.search).toBe(route));

		toastWarningSpy.mockRestore();
	});

	it("should prompt the user to select a profile", async () => {
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		render(<Welcome />, {
			route: mainnetDeepLink,
		});

		await waitFor(() =>
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 }),
		);

		toastWarningSpy.mockRestore();
	});

	it("should redirect to profile if only one available", async () => {
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const profilesSpy = vi.spyOn(env, "profiles").mockImplementationOnce(() => ({
			findById: () => profile,
			values: () => [profile],
		}));

		const { router } = render(<Welcome />, {
			// Using transfer page as an example
			route: "/?method=transfer&coin=mainsail&nethash=c481dea3dcc13708364e576dff94dd499692b56cbc646d5acd22a3902297dd51",
		});

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));

		// Automatically redirects to transfer page
		await waitFor(() => expect(router.state.location.pathname).toBe(`/profiles/${fixtureProfileId}/send-transfer`));

		toastWarningSpy.mockRestore();
		profilesSpy.mockRestore();
	});

	it.each([
		["createProfile", ProfilePaths.CreateProfile],
		["importProfile", ProfilePaths.ImportProfile],
	])("should clear deeplink and do not show a warning toast in %s page", async (page, path) => {
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const { navigate } = render(<Welcome />, {
			route: mainnetDeepLink,
		});

		await waitFor(() => {
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 });
		});

		act(() => {
			navigate(path);
		});

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledTimes(1));

		toastWarningSpy.mockRestore();
	});

	it("should clear the profile validation timeout", () => {
		const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

		const { unmount } = render(<Welcome />, {
			route: mainnetDeepLink,
		});

		unmount();

		expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Object));

		clearTimeoutSpy.mockRestore();
	});

	it.skip("should navigate to sign page", async () => {
		const toastWarningSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const route =
			"?method=sign&coin=mainsail&nethash=c481dea3dcc13708364e576dff94dd499692b56cbc646d5acd22a3902297dd51&message=message+to+sign";

		const { router } = render(<Welcome />, {
			route,
		});

		await waitFor(() => expect(screen.getAllByTestId("ProfileRow")).toHaveLength(2));

		await waitFor(() =>
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 }),
		);
		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[0]);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));
		await waitFor(() =>
			expect(router.state.location.pathname).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/sign-message`),
		);
		await waitFor(() => expect(router.state.location.search).toHaveBeenCalledWith(route));

		toastWarningSpy.mockRestore();
	});

	it("should not navigate when clicking multiple times", async () => {
		const mockValidatorName = vi
			.spyOn(profile.validators(), "findByUsername")
			.mockReturnValue(profile.wallets().first());
		const mockProfiles = vi.spyOn(env.profiles(), "values").mockReturnValue([profile]);
		const mockUsesPassword = vi.spyOn(profile, "usesPassword").mockReturnValue(true);

		const { container, router } = render(<Welcome />, {
			route: "/?method=vote&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&validator=test",
		});

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)));
		await waitFor(() => expect(router.state.location.pathname).toBe("/"));

		mockValidatorName.mockRestore();
		mockProfiles.mockRestore();
		mockUsesPassword.mockRestore();
	});
});

describe("Welcome", () => {
	it("should navigate to profile dashboard", async () => {
		const { container, router } = render(<Welcome />);

		const passwordProtectedProfile = env.profiles().findById(getPasswordProtectedProfileId());

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(passwordProtectedProfile.name()));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await submitPassword();

		expect(router.state.location.pathname).toBe(`/profiles/${passwordProtectedProfile.id()}/dashboard`);
	});

	it("should render with profiles", async () => {
		const { container, router } = render(<Welcome />);
		const profile = env.profiles().findById(mockedProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.name()));

		await submitPassword();

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "SignIn__cancel-button"],
	])("should open & close sign in modal (%s)", async (_, buttonId) => {
		const { container } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(mockedProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.name()));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(profileTranslations.MODAL_SIGN_IN.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(profileTranslations.MODAL_SIGN_IN.DESCRIPTION);

		await userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should navigate to profile dashboard with correct password", async () => {
		const { container, router } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(getPasswordProtectedProfileId());
		await env.profiles().restore(profile, getDefaultPassword());

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.name()));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await submitPassword();

		await waitFor(() => {
			expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
		});
	});

	it("should fail to restore profile", async () => {
		const { container, router } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(getPasswordProtectedProfileId());
		await env.profiles().restore(profile, getDefaultPassword());

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.name()));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId(passwordTestID), "password2");

		await waitFor(() => {
			expect(screen.getByTestId(passwordTestID)).toHaveValue("password2");
		});

		await waitFor(() => {
			expect(screen.getByTestId(submitTestID)).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId(submitTestID));

		await waitFor(() => {
			expect(router.state.location.pathname).toBe(`/`);
		});
	});

	it("should navigate to previous page with correct password", async () => {
		const profile = env.profiles().findById(getPasswordProtectedProfileId());

		const initialRoute = `/profiles/${profile.id()}/dashboard`;
		const { router } = render(<Welcome />, { route: initialRoute });

		await expect(screen.findAllByTestId("ProfileRow")).resolves.toHaveLength(2);

		await env.profiles().restore(profile, getDefaultPassword());

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.name()));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await submitPassword();

		await waitFor(() => {
			expect(router.state.location.pathname).toBe(initialRoute);
		});
	});

	it("should navigate to profile settings with correct password", async () => {
		const { container, router } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(mockedProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		const profileCardMenu = screen.getAllByTestId("dropdown__toggle")[1];

		await userEvent.click(profileCardMenu);

		const settingsOption = screen.getByTestId("dropdown__option--0");

		expect(settingsOption).toBeInTheDocument();
		expect(settingsOption).toHaveTextContent(commonTranslations.SETTINGS);

		await userEvent.click(settingsOption);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId(passwordTestID), "password");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(submitTestID));

		await waitFor(() => {
			expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/settings`);
		});
	});

	it("should navigate to profile settings from profile card menu", async () => {
		const { container, router } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(fixtureProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		const profileCardMenu = screen.getAllByTestId("dropdown__toggle")[0];

		await userEvent.click(profileCardMenu);

		const settingsOption = screen.getByTestId("dropdown__option--0");

		expect(settingsOption).toBeInTheDocument();
		expect(settingsOption).toHaveTextContent(commonTranslations.SETTINGS);

		await userEvent.click(settingsOption);

		await waitFor(() => {
			expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/settings`);
		});
	});

	it("should delete profile from profile card menu", async () => {
		render(<Welcome />);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("ProfileRow")).toHaveLength(2));

		await userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		const deleteOption = screen.getByTestId("dropdown__option--1");

		expect(deleteOption).toHaveTextContent(commonTranslations.DELETE);

		await userEvent.click(deleteOption);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(screen.getAllByTestId("ProfileRow")).toHaveLength(1));
	});

	it("should not select profile on wrong last location", () => {
		const { container, navigate } = render(<Welcome />);

		navigate("/");

		expect(container).toBeInTheDocument();

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should not restart the timeout when closing the modal to retry the profile password", async () => {
		vi.useRealTimers();
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const { container } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(mockedProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		for (const index of [1, 2, 3]) {
			await userEvent.clear(screen.getByTestId(passwordTestID));
			await userEvent.type(screen.getByTestId(passwordTestID), `wrong password ${index}`);

			// wait for form to be updated
			await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId(submitTestID));

			// wait for form to be updated
			await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();
		}

		expect(screen.getByTestId(submitTestID)).toBeDisabled();
		expect(screen.getByTestId(passwordTestID)).toBeDisabled();

		// Close
		await userEvent.click(screen.getByTestId("SignIn__cancel-button"));

		// Reopen
		await userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		// Still disabled
		expect(screen.getByTestId(submitTestID)).toBeDisabled();

		// the timer seems to update only every two seconds
		vi.advanceTimersByTime(120_000);

		// wait for form to be updated
		await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();

		//TODO: Revisit this assertion.
		// await waitFor(() => {
		// 	expect(screen.getByTestId("Input__error")).toHaveAttribute("data-errortext", "Password invalid");
		// });

		vi.useRealTimers();
	});

	it("should change route to create profile", async () => {
		const { container, router } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByText(commonTranslations.CREATE));

		expect(router.state.location.pathname).toBe("/profiles/create");
	});

	it("should render without profiles", async () => {
		env.reset({ httpClient, storage: new StubStorage() });

		const { container } = render(
			<EnvironmentProvider env={env}>
				<Welcome />
			</EnvironmentProvider>,
		);

		expect(container).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITHOUT_PROFILES.TITLE)).toBeInTheDocument();
		});
	});

	it("should use the system theme", async () => {
		const windowSpy = vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches: true }) as any);
		// eslint-disable-next-line testing-library/no-node-access
		const spy = vi.spyOn(document.querySelector("html").classList, "add");

		render(<Welcome />);

		await waitFor(() => {
			expect(spy).toHaveBeenNthCalledWith(1, "dark");
		});

		spy.mockRestore();
		windowSpy.mockRestore();
	});
});
