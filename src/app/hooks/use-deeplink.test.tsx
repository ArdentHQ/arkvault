import React from "react";
import { Route } from "react-router-dom";
import { Contracts } from "@ardenthq/sdk-profiles";

import { waitFor } from "@testing-library/react";
import { createHashHistory } from "history";
import { useDeeplink } from "./use-deeplink";
import { translations } from "@/app/i18n/common/i18n";
import { toasts } from "@/app/services";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { ProfilePaths } from "@/router/paths";

const history = createHashHistory();

const mainnetDeepLink =
	"/?method=transfer&coin=ark&network=ark.mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK";

const deeplinkTest = "Deeplink Test";

const deeplinkTestContent = () => screen.getByText(deeplinkTest);

describe("useDeeplink hook", () => {
	let toastWarningSpy: jest.SpyInstance;
	let toastErrorSpy: jest.SpyInstance;
	let resetProfileNetworksMock: () => void;
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		toastWarningSpy = jest.spyOn(toasts, "warning").mockImplementation();
		toastErrorSpy = jest.spyOn(toasts, "error").mockImplementation();
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		toastWarningSpy.mockRestore();
		toastErrorSpy.mockRestore();
		resetProfileNetworksMock();
	});

	const TestComponent: React.FC = () => {
		useDeeplink();

		return <h1>Deeplink Test</h1>;
	};

	it("should subscribe to deeplink listener and toast a warning to select a profile", () => {
		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
			{
				route: mainnetDeepLink,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(toastWarningSpy).toHaveBeenCalledWith(translations.SELECT_A_PROFILE, { delay: 500 });
	});

	it("should subscribe to deeplink listener and toast a warning to coin not supported", async () => {
		history.push(
			"/?method=transfer&coin=doge&network=mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
		);

		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Invalid URI: Coin "doge" not supported.'));
	});

	it("should subscribe to deeplink listener and toast a warning to network not supported", async () => {
		history.push(
			"/?method=transfer&coin=ark&network=custom&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
		);

		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Invalid URI: Network "custom" is not enabled or added.'));
	});

	it("should subscribe to deeplink listener and toast a warning to no senders available", async () => {
		history.push(mainnetDeepLink);

		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() =>
			expect(toastErrorSpy).toHaveBeenCalledWith(
				'Invalid URI: The current profile has no wallets available for the "ark.mainnet" network',
			),
		);
	});

	it("should subscribe to deeplink listener and navigate", async () => {
		history.push(
			"/?method=transfer&coin=ark&network=ark.devnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
		);

		render(
			<Route pathname="/profiles/:profileId/wallets/:walletId">
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/send-transfer`));
	});

	it("should wait for profile syncing", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const profileStatusMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		history.push(
			"/?method=transfer&coin=ark&network=ark.devnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
		);

		render(
			<Route pathname="/profiles/:profileId/wallets/:walletId">
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() =>
			expect(history.location.pathname).not.toBe(`/profiles/${getDefaultProfileId()}/send-transfer`),
		);
		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/dashboard`));

		profileStatusMock.mockRestore();
	});

	it("should subscribe to deeplink listener and navigate when no method found", async () => {
		history.push("/?coin=ark&network=ark.devnet&delegate=alessio");

		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() => expect(history.location.pathname).toBe("/"));
	});

	it.each([
		["createProfile", ProfilePaths.CreateProfile],
		["importProfile", ProfilePaths.ImportProfile],
	])("should clear deeplink and do not show a warning toast in %S page", async (page, path) => {
		history.push(mainnetDeepLink);

		render(
			<Route pathname={"/"}>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(toastWarningSpy).toHaveBeenCalledWith(translations.SELECT_A_PROFILE, { delay: 500 });

		history.push(path);

		await waitFor(() => expect(toastWarningSpy).toHaveBeenCalledTimes(1));
	});
});
