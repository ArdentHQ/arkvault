/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { truncate } from "@ardenthq/sdk-helpers";
import { renderHook } from "@testing-library/react-hooks";
import { Welcome } from "./Welcome";
import { ProfilePaths } from "@/router/paths";
import { EnvironmentProvider } from "@/app/contexts";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { httpClient, toasts } from "@/app/services";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import { StubStorage } from "@/tests/mocks";
import {
	act,
	env,
	getDefaultPassword,
	getDefaultProfileId,
	getPasswordProtectedProfileId,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();
const profileDashboardUrl = `/profiles/${fixtureProfileId}/dashboard`;

const submitTestID = "SignIn__submit-button";
const passwordTestID = "SignIn__input--password";

const submitPassword = async () => {
	userEvent.paste(screen.getByTestId(passwordTestID), "password");

	await waitFor(() => {
		expect(screen.getByTestId(submitTestID)).toBeEnabled();
	});

	userEvent.click(screen.getByTestId(submitTestID));
};

let toastUpdateSpy: jest.SpyInstance;

const expectToast = async (text: string) => {
	await waitFor(() => expect(toastUpdateSpy).toHaveBeenCalledWith(expect.any(String), "error", text));
};

describe("Welcome with deeplink", () => {
	const history = createHashHistory();
	const mainnetDeepLink =
		"/?method=transfer&coin=ark&network=ark.mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK";

	let resetProfileNetworksMock: () => void;
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(fixtureProfileId);
	});

	beforeEach(() => {
		toastUpdateSpy = jest.spyOn(toasts, "update").mockImplementation();

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		toastUpdateSpy.mockRestore();

		resetProfileNetworksMock();
	});

	it("should navigate to vote page", async () => {
		const mockDelegateName = jest
			.spyOn(env.delegates(), "findByUsername")
			.mockReturnValue(profile.wallets().first());

		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=vote&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&delegate=test",
				withProviders: true,
			},
		);

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/send-vote`));

		mockDelegateName.mockRestore();
	});

	it("should use entered password when using deeplink for a password protected profile", async () => {
		const passwordProtectedProfile = env.profiles().findById(getPasswordProtectedProfileId());
		const mockPasswordGetter = jest
			.spyOn(passwordProtectedProfile.password(), "get")
			.mockReturnValue(getDefaultPassword());

		const mockDelegateName = jest
			.spyOn(env.delegates(), "findByUsername")
			.mockReturnValue(profile.wallets().first());

		render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=vote&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&delegate=test",
				withProviders: true,
			},
		);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(passwordProtectedProfile.name()));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await act(async () => {
			await submitPassword();
		});

		await waitFor(() => expect(mockPasswordGetter).toHaveBeenCalledWith());

		mockDelegateName.mockRestore();
		mockPasswordGetter.mockRestore();
	});

	it("should show a warning if the coin is not supported", async () => {
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=transfer&coin=doge&network=ark.mainnet",
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "COIN_NOT_SUPPORTED", value: "DOGE" }));
	});

	it("should ignore multiple clicks", async () => {
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=transfer&coin=ark",
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

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
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=nuke&coin=ark&network=ark.mainnet",
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "METHOD_NOT_SUPPORTED", value: "nuke" }));
	});

	it("should show a warning if the network and nethash are both missing", async () => {
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=transfer&coin=ark",
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "MISSING_NETWORK_OR_NETHASH" }));
	});

	it("should show a warning if the network parameter is invalid", async () => {
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=transfer&coin=ark&network=custom",
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "NETWORK_INVALID", value: "custom" }));
	});

	it("should show a warning if there are no available senders for network", async () => {
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: mainnetDeepLink,
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "NETWORK_NO_WALLETS", value: "ARK" }));
	});

	it("should show a warning if there is no network for the given nethash", async () => {
		const nethash = "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8987";
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: `/?method=transfer&coin=ark&nethash=${nethash}`,
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		const truncated = truncate(nethash, {
			length: 20,
			omissionPosition: "middle",
		});

		await expectToast(result.current.buildSearchParametersError({ type: "NETHASH_NOT_ENABLED", value: truncated }));
	});

	it("should show a warning if there are no available senders for the network with the given nethash", async () => {
		const nethash = "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988";
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: `/?method=transfer&coin=ark&nethash=${nethash}`,
				withProviders: true,
			},
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await expectToast(result.current.buildSearchParametersError({ type: "NETWORK_NO_WALLETS", value: "ARK" }));
	});

	it("should navigate to transfer page with network parameter", async () => {
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=transfer&coin=ark&network=ark.devnet",
				withProviders: true,
			},
		);

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/send-transfer`));
	});

	it("should navigate to transfer page with nethash parameter", async () => {
		const { container } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: "/?method=transfer&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
				withProviders: true,
			},
		);

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/send-transfer`));
	});

	it("should redirect to profile if only one available", async () => {
		const toastWarningSpy = jest.spyOn(toasts, "warning").mockImplementation();

		const profilesSpy = jest.spyOn(env, "profiles").mockImplementationOnce(() => ({
			findById: () => profile,
			values: () => [profile],
		}));

		render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				// Using transfer page as an example
				route: "/?method=transfer&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
				withProviders: true,
			},
		);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));

		// Automatically redirects to transfer page
		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/send-transfer`));

		toastWarningSpy.mockRestore();
		profilesSpy.mockRestore();
	});

	it("should redirect to password protected profile if only one available", async () => {
		const passwordProtectedProfile = env.profiles().findById(getPasswordProtectedProfileId());

		const mockPasswordGetter = jest
			.spyOn(passwordProtectedProfile.password(), "get")
			.mockReturnValue(getDefaultPassword());

		const toastWarningSpy = jest.spyOn(toasts, "warning").mockImplementation();

		const profilesSpy = jest.spyOn(env, "profiles").mockImplementationOnce(() => ({
			findById: () => passwordProtectedProfile,
			values: () => [passwordProtectedProfile],
		}));

		render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				// Using transfer page as an example
				route: "/?method=transfer&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
				withProviders: true,
			},
		);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await act(async () => {
			await submitPassword();
		});

		await waitFor(() => expect(mockPasswordGetter).toHaveBeenCalledWith());
		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.VALIDATING_URI));

		mockPasswordGetter.mockRestore();
		toastWarningSpy.mockRestore();
		profilesSpy.mockRestore();
	});

	it("should prompt the user to select a profile", async () => {
		const toastWarningSpy = jest.spyOn(toasts, "warning").mockImplementation();

		render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: mainnetDeepLink,
				withProviders: true,
			},
		);

		await waitFor(() =>
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 }),
		);

		toastWarningSpy.mockRestore();
	});

	it.each([
		["createProfile", ProfilePaths.CreateProfile],
		["importProfile", ProfilePaths.ImportProfile],
	])("should clear deeplink and do not show a warning toast in %s page", async (page, path) => {
		const toastWarningSpy = jest.spyOn(toasts, "warning").mockImplementation();

		render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: mainnetDeepLink,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(toastWarningSpy).toHaveBeenCalledWith(commonTranslations.SELECT_A_PROFILE, { delay: 500 });
		});

		history.push(path);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledTimes(1));

		toastWarningSpy.mockRestore();
	});

	it("should clear the profile validation timeout", async () => {
		const clearTimeoutSpy = jest.spyOn(window, "clearTimeout");

		const { unmount } = render(
			<Route path="/">
				<Welcome />
			</Route>,
			{
				history,
				route: mainnetDeepLink,
				withProviders: true,
			},
		);

		unmount();

		expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Number));

		clearTimeoutSpy.mockRestore();
	});
});

describe("Welcome", () => {
	it("should render with profiles", () => {
		const { container, asFragment, history } = render(<Welcome />);
		const profile = env.profiles().findById(fixtureProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.name()));

		expect(history.location.pathname).toBe(profileDashboardUrl);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to profile dashboard", () => {
		const { container, asFragment, history } = render(<Welcome />);

		const profile = env.profiles().findById(fixtureProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "SignIn__cancel-button"],
	])("should open & close sign in modal (%s)", async (_, buttonId) => {
		const { container } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(profile.name()));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(profileTranslations.MODAL_SIGN_IN.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(profileTranslations.MODAL_SIGN_IN.DESCRIPTION);

		userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should navigate to profile dashboard with correct password", async () => {
		const { asFragment, container, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(getPasswordProtectedProfileId());
		await env.profiles().restore(profile, getDefaultPassword());

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(profile.name()));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await act(async () => {
			await submitPassword();
		});

		await waitFor(() => {
			expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to previous page with correct password", async () => {
		const profile = env.profiles().findById(getPasswordProtectedProfileId());
		const history = createHashHistory();
		history.replace("/", {
			from: `/profiles/${profile.id()}/exchange`,
		});

		const { asFragment, container } = render(<Welcome />, { history });

		expect(container).toBeInTheDocument();
		await expect(screen.findAllByTestId("Card")).resolves.toHaveLength(3);

		await env.profiles().restore(profile, getDefaultPassword());

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await act(async () => {
			await submitPassword();
		});

		await waitFor(() => {
			expect(history.location.pathname).toBe(`/profiles/${profile.id()}/exchange`);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to profile settings with correct password", async () => {
		const { asFragment, container, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		const profileCardMenu = screen.getAllByTestId("dropdown__toggle")[1];

		userEvent.click(profileCardMenu);

		const settingsOption = screen.getByTestId("dropdown__option--0");

		expect(settingsOption).toBeInTheDocument();
		expect(settingsOption).toHaveTextContent(commonTranslations.SETTINGS);

		userEvent.click(settingsOption);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId(passwordTestID), "password");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(submitTestID));

		await waitFor(() => {
			expect(history.location.pathname).toBe(`/profiles/${profile.id()}/settings`);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to profile settings from profile card menu", async () => {
		const { container, asFragment, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(fixtureProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		const profileCardMenu = screen.getAllByTestId("dropdown__toggle")[0];

		userEvent.click(profileCardMenu);

		const settingsOption = screen.getByTestId("dropdown__option--0");

		expect(settingsOption).toBeInTheDocument();
		expect(settingsOption).toHaveTextContent(commonTranslations.SETTINGS);

		userEvent.click(settingsOption);

		await waitFor(() => {
			expect(history.location.pathname).toBe(`/profiles/${profile.id()}/settings`);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should delete profile from profile card menu", async () => {
		render(<Welcome />);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(3));

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		const deleteOption = screen.getByTestId("dropdown__option--1");

		expect(deleteOption).toHaveTextContent(commonTranslations.DELETE);

		userEvent.click(deleteOption);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(2));
	});

	it("should not select profile on wrong last location", () => {
		const history = createHashHistory();
		history.replace("/", {
			from: `/wronguri/exchange`,
		});
		const { asFragment, container } = render(<Welcome />, { history });

		expect(container).toBeInTheDocument();

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should not restart the timeout when closing the modal to retry the profile password", async () => {
		jest.useFakeTimers();

		const { container } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		for (const index of [1, 2, 3]) {
			userEvent.paste(screen.getByTestId(passwordTestID), `wrong password ${index}`);

			// wait for form to be updated
			await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(submitTestID));

			// wait for form to be updated
			await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();
		}

		expect(screen.getByTestId(submitTestID)).toBeDisabled();
		expect(screen.getByTestId(passwordTestID)).toBeDisabled();

		act(() => {
			jest.advanceTimersByTime(15_000);
		});

		// Close
		userEvent.click(screen.getByTestId("SignIn__cancel-button"));

		// Reopen
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		// Still disabled
		expect(screen.getByTestId(submitTestID)).toBeDisabled();

		act(() => {
			jest.advanceTimersByTime(50_000);
			jest.clearAllTimers();
		});

		// wait for form to be updated
		await expect(screen.findByTestId(submitTestID)).resolves.toBeVisible();

		await waitFor(
			() => expect(screen.getByTestId("Input__error")).toHaveAttribute("data-errortext", "Password invalid"),
			{
				timeout: 10_000,
			},
		);

		jest.useRealTimers();
	});

	it("should change route to create profile", () => {
		const { container, asFragment, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		userEvent.click(screen.getByText(commonTranslations.CREATE));

		expect(history.location.pathname).toBe("/profiles/create");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without profiles", () => {
		env.reset({ coins: {}, httpClient, storage: new StubStorage() });

		const { container, asFragment } = render(
			<EnvironmentProvider env={env}>
				<Welcome />
			</EnvironmentProvider>,
		);

		expect(container).toBeInTheDocument();

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITHOUT_PROFILES.TITLE)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should use the system theme", () => {
		const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		// eslint-disable-next-line testing-library/no-node-access
		const spy = jest.spyOn(document.querySelector("html").classList, "add");

		render(<Welcome />);

		expect(spy).toHaveBeenNthCalledWith(1, theme);

		spy.mockRestore();
	});
});
