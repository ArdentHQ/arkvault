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

const buildToastMessage = (message: string) => `Invalid URI: ${message}`;

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

	it("should navigate to transfer page with nethash parameter", async () => {
		history.push(
			"/?method=transfer&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
		);

		render(
			<Route>
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

		history.push("/?method=transfer&coin=ark&network=ark.devnet");

		render(
			<Route>
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

	it.each([
		["createProfile", ProfilePaths.CreateProfile],
		["importProfile", ProfilePaths.ImportProfile],
	])("should clear deeplink and do not show a warning toast in %s page", async (page, path) => {
		history.push(mainnetDeepLink);

		render(
			<Route>
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

	it("should navigate to vote page", async () => {
		const mockDelegateName = jest
			.spyOn(env.delegates(), "findByUsername")
			.mockReturnValue(profile.wallets().first());

		history.push(
			"/?method=vote&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&delegate=test",
		);

		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/send-vote`));

		mockDelegateName.mockRestore();
	});
});
