/* eslint-disable testing-library/no-node-access */
import { ARK } from "@ardenthq/sdk-ark";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { render, RenderResult } from "@testing-library/react";
import {BrowserHistory, createHashHistory, HashHistory, To} from "history";
import React from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";
import { I18nextProvider } from "react-i18next";
import {Router, Routes} from "react-router-dom";
import { Context as ResponsiveContext } from "react-responsive";
import { ConfigurationProvider, EnvironmentProvider, LedgerProvider, NavigationProvider } from "@/app/contexts";
import { useProfileSynchronizer } from "@/app/hooks/use-profile-synchronizer";
import { i18n } from "@/app/i18n";
import { httpClient } from "@/app/services";
import { LayoutBreakpoint } from "@/types";
import fixtureData from "@/tests/fixtures/env/storage.json";
import TestingPasswords from "@/tests/fixtures/env/testing-passwords.json";
import DefaultManifest from "@/tests/fixtures/coins/ark/manifest/default.json";
import { StubStorage } from "@/tests/mocks";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
export {
	mockNanoSTransport,
	mockLedgerTransportError,
	mockNanoXTransport,
	mockConnectedTransport,
	mockLedgerDevicesList,
} from "./ledger-test-helpers";

const ProfileSynchronizer = ({ children, options }: { children?: React.ReactNode; options?: Record<string, any> }) => {
	const { profile, profileIsSyncing } = useProfileSynchronizer(options);

	if (!profile?.id()) {
		return <>{children}</>;
	}

	if (profileIsSyncing) {
		return <></>;
	}

	return <>{children}</>;
};

export const WithProviders = ({ children }: { children?: React.ReactNode }) => (
	<I18nextProvider i18n={i18n}>
		<EnvironmentProvider env={env}>
			<LedgerProvider>
				<ConfigurationProvider>
					<NavigationProvider>{children}</NavigationProvider>
				</ConfigurationProvider>
			</LedgerProvider>
		</EnvironmentProvider>
	</I18nextProvider>
);

const customRender = (component: React.ReactElement, options: any = {}) =>
	render(component, { wrapper: WithProviders, ...options });

export function renderWithForm(
	component: React.ReactElement,
	options?: {
		withProviders?: boolean;
		defaultValues?: any;
		registerCallback?: (useFormMethods: UseFormMethods) => void;
		shouldUnregister?: boolean;
		breakpoint?: LayoutBreakpoint;
	},
) {
	let renderFunction: any;
	let responsiveRenderFunction: any;

	if (options?.breakpoint) {
		responsiveRenderFunction = options?.withProviders ?? true ? renderResponsiveWithRoute : renderResponsive;
	} else {
		renderFunction = options?.withProviders ?? true ? renderWithRouter : render;
	}

	const defaultValues = options?.defaultValues ?? {};

	let form: UseFormMethods | undefined;

	const Component = () => {
		form = useForm<any>({
			defaultValues,
			mode: "onChange",
			shouldUnregister: options?.shouldUnregister,
		});

		options?.registerCallback?.(form);

		return <FormProvider {...form}>{component}</FormProvider>;
	};

	if (renderFunction !== undefined) {
		const utils: RenderResult = renderFunction(<Component />, {
			withProviders: options?.withProviders,
		});

		return { ...utils, form: () => form };
	}

	const utils: RenderResult = responsiveRenderFunction(<Component />, options?.breakpoint, {
		withProviders: options?.withProviders,
	});

	return { ...utils, form: () => form };
}

interface RenderWithRouterOptions {
	route?: To;
	state?: Record<string, any>;
	history?: HashHistory;
	withProviders?: boolean;
	withProfileSynchronizer?: boolean;
	profileSynchronizerOptions?: Record<string, any>;
}

interface Props {
	basename?: string;
	children: React.ReactNode;
	history: BrowserHistory;
}

const CustomRouter = ({ basename, children, history }: Props) => {
	const [state, setState] = React.useState({
		action: history.action,
		location: history.location,
	});

	React.useLayoutEffect(() => history.listen(setState),[history])

	return (
		<Router
			basename={basename}
			location={state.location}
			navigator={history}
			navigationType={state.action}
		>
			{children}
		</Router>
	);
};

const renderWithRouter = (
	component: React.ReactElement,
	{
		route,
		state,
		history,
		withProviders = true,
		withProfileSynchronizer = false,
		profileSynchronizerOptions,
	}: RenderWithRouterOptions = {},
) => {
	if (!history) {
		history = createHashHistory();
		history.replace("/");
	}
	if (route) {
		history.replace(route, state ?? {});
	}

	const ProfileSynchronizerWrapper = ({ children }: { children: React.ReactNode }) =>
		withProfileSynchronizer ? (
			<ProfileSynchronizer options={profileSynchronizerOptions}>{children}</ProfileSynchronizer>
		) : (
			<>{children}</>
		);

	const RouterWrapper = ({ children }: { children: React.ReactNode }) =>
		withProviders ? (
			<WithProviders>
				<CustomRouter history={history}>
					<ProfileSynchronizerWrapper>{children}</ProfileSynchronizerWrapper>
				</CustomRouter>
			</WithProviders>
		) : (
			<CustomRouter history={history}>{children}</CustomRouter>
		);

	const child = component.type.name === "Route" ? <Routes>{component}</Routes> : component;

	return {
		...customRender(child, { wrapper: RouterWrapper }),
		history,
	};
};

export * from "@testing-library/react";

export { renderWithRouter as render, customRender as renderWithoutRouter };

export const getDefaultProfileId = () => Object.keys(fixtureData.profiles)[0];
export const getPasswordProtectedProfileId = () => Object.keys(fixtureData.profiles)[1];
export const getDefaultWalletId = () => Object.keys(Object.values(fixtureData.profiles)[0].wallets)[0];
export const getDefaultWalletMnemonic = () => "master dizzy era math peanut crew run manage better flame tree prevent";

export const getDefaultPassword = () => TestingPasswords.profiles[getPasswordProtectedProfileId()]?.password;

const environmentWithMocks = () =>
	new Environment({
		coins: { ARK },
		httpClient,
		ledgerTransportFactory,
		storage: new StubStorage(),
	});

export const env = environmentWithMocks();

export const syncDelegates = async (profile: Contracts.IProfile) => await env.delegates().syncAll(profile);

export const syncFees = async (profile: Contracts.IProfile) => await env.fees().syncAll(profile);

export const MNEMONICS = [
	"skin fortune security mom coin hurdle click emotion heart brisk exact rather code feature era leopard grocery tide gift power lawsuit sight vehicle coin",
	"audit theory scheme profit away wing rescue cloth fit spell atom rely enter upon man clutch divide buddy office tuition input bundle silk scheme",
	"uphold egg salon police home famous focus fade skin virus fence surprise hidden skate word famous movie grant ghost save fly assume motion case",
	"dress assault rich club glass fancy hood glance install buzz blur attack room outdoor chapter melody tide blur trend into have accuse very little",
	"already device awful potato face kingdom coral biology badge donkey ranch random when dove solve system tonight purchase foot way deliver grow raccoon blame",
	"garden neglect enable bone inform deal shallow smart train enrich cloud police pave ignore assault wrong chef harbor river brain way essay zero mouse",
	"analyst rifle dose thank unfair remain claim exile math foster clarify unfair gauge wasp notice crash sustain session lunch verify gasp try divorce slender",
	"tray analyst bulk topple night swing list execute walk bronze invite title silent loud cash apology sibling wheel thumb dragon black soccer mixed curious",
	"cool path congress harbor position ready embody hunt face field boil brown rubber toss arrange later convince anxiety foam urban monster endless essay melt",
	"subway cradle salad cake toddler sausage neglect eight cruel fault mammal cannon south interest theory sadness pass move outside segment curtain toddler save banner",
];

export const breakpoints: {
	[key in LayoutBreakpoint | "xs"]: number;
} = {
	lg: 1024,
	md: 768,
	sm: 640,
	xl: 1280,
	xs: 375,
};

export const renderResponsive = (component: React.ReactElement, breakpoint: LayoutBreakpoint | "xs") =>
	render(
		<WithProviders>
			<ResponsiveContext.Provider value={{ width: breakpoints[breakpoint] }}>
				{component}
			</ResponsiveContext.Provider>
		</WithProviders>,
	);

export const renderResponsiveWithRoute = (
	component: React.ReactElement,
	breakpoint: LayoutBreakpoint | "xs",
	options: RenderWithRouterOptions,
) => {
	const widths: {
		[key in LayoutBreakpoint | "xs"]: number;
	} = {
		lg: 1024,
		md: 768,
		sm: 640,
		xl: 1280,
		xs: 375,
	};

	const child = component.type.name === "Route" ? <Routes>{component}</Routes> : component;

	return renderWithRouter(
		<ResponsiveContext.Provider value={{ width: widths[breakpoint] }}>{child}</ResponsiveContext.Provider>,
		options,
	);
};

const publicNetworksStub: any = {
	ark: {
		mainnet: {
			...DefaultManifest,
			coin: "ARK",
			currency: {
				ticker: "ARK",
			},
			id: "ark.mainnet",
			name: "Mainnet",
			type: "live",
		},
	},
};

const testNetworksStub: any = {
	ark: {
		devnet: {
			...DefaultManifest,
			coin: "ARK",
			currency: {
				ticker: "DARK",
			},
			id: "ark.devnet",
			meta: {
				...DefaultManifest.meta,
				nethash: "2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
				version: 30,
			},
			name: "Devnet",
			type: "test",
		},
	},
};

const customNetworksStub: any = {
	random: {
		custom: {
			...DefaultManifest,
			coin: "ARK",
			currency: {
				ticker: "ARK",
			},
			id: "random.custom",
			name: "Devnet",
			type: "test",
		},
	},
	"random-enabled": {
		custom: {
			...DefaultManifest,
			coin: "ARK",
			currency: {
				ticker: "ARK",
			},
			id: "random-enabled.custom",
			meta: {
				enabled: true,
				epoch: "2017-03-21T13:00:00.000Z",
				nethash: "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988",
				version: 23,
			},
			name: "Devnet",
			type: "test",
		},
	},
};

export const mockProfileWithOnlyPublicNetworks = (profile: Contracts.IProfile) => {
	const mock = vi.spyOn(profile.networks(), "all").mockReturnValue(publicNetworksStub);

	return () => {
		mock.mockRestore();
	};
};

export const mockProfileWithPublicAndTestNetworks = (profile: Contracts.IProfile) => {
	const networks = {
		ark: {
			...publicNetworksStub["ark"],
			...testNetworksStub["ark"],
		},
		random: {
			...customNetworksStub["random-enabled"],
			...customNetworksStub["random"],
		},
	};

	const allMock = vi.spyOn(profile.networks(), "all").mockReturnValue(networks);
	const allByCoinMock = vi
		.spyOn(profile.networks(), "allByCoin")
		.mockImplementation((coin: string) => Object.values(networks[coin.toLowerCase()] ?? []));

	return () => {
		allMock.mockRestore();
		allByCoinMock.mockRestore();
	};
};

// This helper function is used to prevent assertion error in SDK (ArrayBuffer error in randomFillSync) when signing messages.
//
// It needs to be called only once before calling `message.sign` in tests in order to properly initialize global instances (in sdk) and prevent
// from throwing false assertions against types & instances (Buffer & ArrayBuffer).
//
// This is probably caused by how jsdom initialization runs with vitest as it's not an issue with jsdom in jest.
export const triggerMessageSignOnce = async (wallet: Contracts.IReadWriteWallet) => {
	try {
		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());
		await wallet.message().sign({ message: "message", signatory });
	} catch {
		//
	}
};

export const queryElementForSvg = (target: HTMLElement, svg: string) => target.querySelector(`svg#${svg}`);

export const generateHistoryCalledWith = ({ pathname = "", hash = "", search = "" }) => {
	return [
		{
			hash,
			pathname,
			search,
		},
		undefined,
		{},
	]
}
