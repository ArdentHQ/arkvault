import React from "react";
import { Route } from "react-router-dom";
import { Contracts } from "@ardenthq/sdk-profiles";

import { waitFor } from "@testing-library/react";
import { createHashHistory } from "history";
import { renderHook } from "@testing-library/react-hooks";
import { useTranslation } from "react-i18next";
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

	it("should prompt the user to select a profile", () => {
		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				route: mainnetDeepLink,
			},
		);

		expect(deeplinkTestContent()).toBeInTheDocument();
		expect(toastWarningSpy).toHaveBeenCalledWith(translations.SELECT_A_PROFILE, { delay: 500 });
	});

	it("should show a warning if the coin is missing", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		history.push("/?method=transfer&network=ark.mainnet");

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.COIN") })),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if the coin is not supported", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		history.push("/?method=transfer&coin=doge&network=ark.mainnet");

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin: "DOGE" })),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if the method is missing", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		history.push("/?coin=ark&network=ark.mainnet");

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.METHOD") })),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if the method is not supported", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		history.push("/?method=nuke&coin=ark&network=ark.mainnet");

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.METHOD_NOT_SUPPORTED", { method: "nuke" })),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if the network and nethash are both missing", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		history.push("/?method=transfer&coin=ark");

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(
					t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter: t("COMMON.NETWORK_OR_NETHASH") }),
				),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if the network parameter is invalid", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		history.push("/?method=transfer&coin=ark&network=custom");

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network: "custom" })),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if there are no available senders for network", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

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

		history.push(`/profiles/${getDefaultProfileId()}/dashboard`);

		await waitFor(() =>
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.NETWORK_NO_WALLETS", { network: "ark.mainnet" })),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if there is no network for the given nethash", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const nethash = "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8987";

		history.push(`/?method=transfer&coin=ark&nethash=${nethash}`);

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.NETHASH_NOT_ENABLED", { nethash })),
				{ delay: 5000 },
			),
		);
	});

	it("should show a warning if there are no available senders for the network with the given nethash", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const nethash = "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988";

		history.push(`/?method=transfer&coin=ark&nethash=${nethash}`);

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
			expect(toastErrorSpy).toHaveBeenCalledWith(
				buildToastMessage(t("TRANSACTION.VALIDATION.NETHASH_NO_WALLETS", { nethash })),
				{ delay: 5000 },
			),
		);
	});

	it("should navigate to transfer page with network parameter", async () => {
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

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/send-transfer`));
	});

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

	it("should navigate to verify message page", async () => {
		history.push(
			"/?method=verify&coin=ark&network=ark.devnet&message=hello+world&signatory=signatory&signature=signature",
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

		await waitFor(() =>
			expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/verify-message`),
		);
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
