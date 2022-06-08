import { ARK } from "@payvo/sdk-ark";
import { Contracts, Environment } from "@payvo/sdk-profiles";
import { render, RenderResult } from "@testing-library/react";
import { createHashHistory, HashHistory, To } from "history";
import nock from "nock";
import React from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";
import { I18nextProvider } from "react-i18next";
import { Router } from "react-router-dom";
import { Context as ResponsiveContext } from "react-responsive";
import { ConfigurationProvider, EnvironmentProvider, LedgerProvider, NavigationProvider } from "@/app/contexts";
import { useProfileSynchronizer } from "@/app/hooks/use-profile-synchronizer";
import { i18n } from "@/app/i18n";
import { httpClient } from "@/app/services";
import { LayoutBreakpoint } from "@/types";
import delegate from "@/tests/fixtures/coins/ark/devnet/wallets/D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib.json";
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

export const WithProviders: React.FC = ({ children }: { children?: React.ReactNode }) => (
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
	},
) {
	const renderFunction = options?.withProviders ?? true ? renderWithRouter : render;
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

	const utils: RenderResult = renderFunction(<Component />);

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
				<Router history={history}>
					<ProfileSynchronizerWrapper>{children}</ProfileSynchronizerWrapper>
				</Router>
			</WithProviders>
		) : (
			<Router history={history}>{children}</Router>
		);

	return {
		...customRender(component, { wrapper: RouterWrapper }),
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

export const defaultNetMocks = () => {
	nock.disableNetConnect();

	// devnet
	nock("https://ark-test.arkvault.io")
		.get("/api/blockchain")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/blockchain.json"))
		.get("/api/node/configuration")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/configuration.json"))
		.get("/api/peers")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/peers.json"))
		.get("/api/node/configuration/crypto")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/cryptoConfiguration.json"))
		.get("/api/node/syncing")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/syncing.json"))
		.get("/api/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json"))
		.get("/api/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr.json"))
		.get("/api/wallets/DNTwQTSp999ezQ425utBsWetcmzDuCn2pN")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/DNTwQTSp999ezQ425utBsWetcmzDuCn2pN.json"))
		.get("/api/wallets/DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq.json"))
		.get("/api/wallets/D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib")
		.reply(200, delegate)
		.get("/api/wallets/034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192")
		.reply(200, delegate)
		.get("/api/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD.json"))
		.get("/api/wallets/DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T.json"))
		.get("/api/wallets/DKrACQw7ytoU2gjppy3qKeE2dQhZjfXYqu")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/DKrACQw7ytoU2gjppy3qKeE2dQhZjfXYqu.json"))
		.get("/api/wallets/D9YiyRYMBS2ofzqkufjrkB9nHofWgJLM7f")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/wallets/D9YiyRYMBS2ofzqkufjrkB9nHofWgJLM7f.json"))
		.get("/api/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD/votes")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/votes.json"))
		.get("/api/delegates")
		.query(true)
		.reply(200, require("../tests/fixtures/coins/ark/devnet/delegates.json"))
		.get(/\/api\/delegates\/.+/)
		.reply(200, delegate)
		.get("/api/node/fees")
		.query(true)
		.reply(200, require("../tests/fixtures/coins/ark/devnet/node-fees.json"))
		.get("/api/transactions/fees")
		.reply(200, require("../tests/fixtures/coins/ark/devnet/transaction-fees.json"))
		.persist();

	// mainnet
	nock("https://ark-live.arkvault.io")
		.get("/api/node/configuration")
		.reply(200, require("../tests/fixtures/coins/ark/mainnet/configuration.json"))
		.get("/api/peers")
		.reply(200, require("../tests/fixtures/coins/ark/mainnet/peers.json"))
		.get("/api/node/configuration/crypto")
		.reply(200, require("../tests/fixtures/coins/ark/mainnet/cryptoConfiguration.json"))
		.get("/api/node/syncing")
		.reply(200, require("../tests/fixtures/coins/ark/mainnet/syncing.json"))
		.get("/api/wallets/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX")
		.reply(200, require("../tests/fixtures/coins/ark/mainnet/wallets/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX.json"))
		.persist();

	nock("https://min-api.cryptocompare.com")
		.get("/data/dayAvg?fsym=DARK&tsym=BTC&toTs=1593561600")
		.reply(200, require("tests/fixtures/exchange/cryptocompare.json"))
		.get("/data/dayAvg?fsym=ARK&tsym=BTC&toTs=1593561600")
		.reply(200, require("tests/fixtures/exchange/cryptocompare.json"))
		.get("/data/histoday")
		.query(true)
		.reply(200, require("../tests/fixtures/exchange/cryptocompare-historical.json"))
		.persist();

	nock("https://exchanges.arkvault.io")
		.get("/api")
		.reply(200, require("tests/fixtures/exchange/exchanges.json"))
		.get("/api/changenow/currencies")
		.reply(200, require("tests/fixtures/exchange/changenow/currencies.json"))
		.get("/api/changenow/currencies/ark")
		.reply(200, require("tests/fixtures/exchange/changenow/currency-ark.json"))
		.get("/api/changenow/currencies/btc")
		.reply(200, require("tests/fixtures/exchange/changenow/currency-btc.json"))
		.get("/api/changenow/tickers/btc/ark")
		.reply(200, require("tests/fixtures/exchange/changenow/minimum.json"))
		.get("/api/changenow/currencies/ark/payoutAddress")
		.reply(200, { data: true })
		.get("/api/changenow/tickers/ark/btc")
		.reply(200, require("tests/fixtures/exchange/changenow/minimum.json"))
		.get(new RegExp("/api/changenow/tickers/[a-z]{3}/[a-z]{3}/1$"))
		.reply(200, require("tests/fixtures/exchange/changenow/estimate.json"))
		.persist();
};

export const useDefaultNetMocks = defaultNetMocks;

const environmentWithMocks = () => {
	defaultNetMocks();
	return new Environment({
		coins: { ARK },
		httpClient,
		ledgerTransportFactory,
		storage: new StubStorage(),
	});
};

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

	return renderWithRouter(
		<WithProviders>
			<ResponsiveContext.Provider value={{ width: widths[breakpoint] }}>{component}</ResponsiveContext.Provider>
		</WithProviders>,
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
				ticker: "ARK",
			},
			id: "ark.devnet",
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
	const mock = jest.spyOn(profile.networks(), "all").mockReturnValue(publicNetworksStub);

	return () => {
		mock.mockRestore();
	};
};

export const mockProfileWithPublicAndTestNetworks = (profile: Contracts.IProfile) => {
	const mock = jest.spyOn(profile.networks(), "all").mockReturnValue({
		ark: {
			...publicNetworksStub["ark"],
			...testNetworksStub["ark"],
		},
		ramdom: {
			...customNetworksStub["random-enabled"],
			...customNetworksStub["random"],
		},
	});

	return () => {
		mock.mockRestore();
	};
};
