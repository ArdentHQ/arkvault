/* eslint-disable no-empty-pattern */
/* eslint-disable testing-library/no-node-access */
import { ConfigurationProvider, EnvironmentProvider, LedgerProvider, NavigationProvider } from "@/app/contexts";
import { Contracts, Environment } from "@/app/lib/profiles";
import { FormProvider, UseFormMethods, useForm } from "react-hook-form";
import { RenderResult, render, renderHook } from "@testing-library/react";

import { createMemoryRouter, RouterProvider, useLocation } from "react-router-dom";
import { BigNumber } from "@/app/lib/helpers";
import { DTO } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import { I18nextProvider, useTranslation } from "react-i18next";
import { LayoutBreakpoint } from "@/types";
import { Mainsail } from "@/app/lib/mainsail";
import MainsailDefaultManifest from "@/tests/fixtures/coins/mainsail/manifest/default.json";
import React, { ReactNode, useEffect } from "react";
import { Context as ResponsiveContext } from "react-responsive";
import { StubStorage } from "@/tests/mocks";
import TestingPasswords from "@/tests/fixtures/env/testing-passwords.json";
import fixtureData from "@/tests/fixtures/env/storage.json";
import { httpClient } from "@/app/services";
import { i18n } from "@/app/i18n";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
import mainsailTransactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { useProfileSynchronizer } from "@/app/hooks/use-profile-synchronizer";
import { test as baseTest } from "vitest";
import { bootEnvironmentWithProfileFixtures } from "./test-helpers";
import { BIP44CoinType } from "@/app/lib/profiles/wallet.factory.contract";

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
		responsiveRenderFunction = (options.withProviders ?? true) ? renderResponsiveWithRoute : renderResponsive;
	} else {
		renderFunction = (options?.withProviders ?? true) ? renderWithRouter : render;
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
	route?: string;
	routes?: Array<{ path: string; element: React.ReactElement }>;
	initialEntries?: string[];
	withProviders?: boolean;
	withProfileSynchronizer?: boolean;
	profileSynchronizerOptions?: Record<string, any>;
}

export const LocationTracker = ({ onLocationChange }: { onLocationChange?: (location: Location) => void }) => {
	const location = useLocation();

	useEffect(() => {
		onLocationChange?.(location);
	}, [location]);

	return null;
};

export const Providers = ({ children, route = "/" }: { children: ReactNode; route?: string }) => {
	const router = createMemoryRouter(
		[
			{
				element: children,
				path: "/*",
			},
		],
		{
			initialEntries: [route],
		},
	);

	return (
		<WithProviders>
			<RouterProvider router={router}>
				<ProfileSynchronizer>{children}</ProfileSynchronizer>
			</RouterProvider>
		</WithProviders>
	);
};

const renderWithRouter = (
	component: React.ReactElement,
	{
		route = "/",
		withProviders = true,
		withProfileSynchronizer = false,
		profileSynchronizerOptions,
	}: {
		route?: string;
		withProviders?: boolean;
		withProfileSynchronizer?: boolean;
		profileSynchronizerOptions?: Record<string, any>;
	} = {},
) => {
	const router = createMemoryRouter(
		[
			{
				element: component,
				path: "/*",
			},
		],
		{
			initialEntries: [route],
		},
	);

	const ProfileSynchronizerWrapper = ({ children }: { children: React.ReactNode }) =>
		withProfileSynchronizer ? (
			<ProfileSynchronizer options={profileSynchronizerOptions}>{children}</ProfileSynchronizer>
		) : (
			<>{children}</>
		);

	const Wrapper = ({ children }: { children: React.ReactNode }) => {
		const content = (
			<RouterProvider router={router}>
				<ProfileSynchronizerWrapper>{children}</ProfileSynchronizerWrapper>
			</RouterProvider>
		);

		return withProviders ? <WithProviders>{content}</WithProviders> : content;
	};

	const view = render(<Wrapper>{component}</Wrapper>);

	return {
		...view,
		navigate: (to: string) => router.navigate(to),
		rerender: (children?: ReactNode) => {
			if (withProviders) {
				return view.rerender(
					<WithProviders>
						<Wrapper>{children ?? component}</Wrapper>
					</WithProviders>,
				);
			}

			return view.rerender(<Wrapper>{children ?? component}</Wrapper>);
		},
		router,
	};
};

export const createTestRouter = (
	routes: Array<{ path: string; element: React.ReactElement }>,
	initialEntries?: string[],
) =>
	createMemoryRouter(routes, {
		initialEntries: initialEntries || ["/"],
	});

export * from "@testing-library/react";

export { renderWithRouter as render, customRender as renderWithoutRouter };

export const getDefaultProfileId = () => getMainsailProfileId();
export const getPasswordProtectedProfileId = () => Object.keys(fixtureData.profiles)[1];
export const getDefaultWalletId = () => Object.keys(Object.values(fixtureData.profiles)[0].wallets)[0];
export const getDefaultMainsailWalletId = () => Object.keys(Object.values(fixtureData.profiles)[0].wallets)[0];
export const getDefaultWalletMnemonic = () => getDefaultMainsailWalletMnemonic();
export const getDefaultMainsailWalletMnemonic = () =>
	"embody plug round swamp sick minor notable catch idle discover barely easily audit near essence crater stand arch phone border minimum smile above exercise";
export const getMainsailProfileId = () => Object.keys(fixtureData.profiles)[0];

export const getDefaultPassword = () => TestingPasswords.profiles[getPasswordProtectedProfileId()]?.password;

const environmentWithMocks = () =>
	new Environment({
		coins: { Mainsail },
		httpClient,
		ledgerTransportFactory,
		storage: new StubStorage(),
	});

export const env = environmentWithMocks();

export const syncValidators = async (profile: Contracts.IProfile) => await profile.validators().syncAll(profile);

export const syncFees = async (profile: Contracts.IProfile) => await env.fees().sync(profile);

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

export const MAINSAIL_MNEMONICS = [
	// 0x659A76be283644AEc2003aa8ba26485047fd1BFB
	"join pyramid pitch bracket gasp sword flip elephant property actual current mango man seek merge gather fix unit aspect vault cheap gospel garment spring",
	// 0x125b484e51Ad990b5b3140931f3BD8eAee85Db23
	"monkey wage old pistol text garage toss evolve twenty mirror easily alarm ocean catch phrase hen enroll verb trade great limb diesel sight describe",
	// 0x393f3F74F0cd9e790B5192789F31E0A38159ae03
	"fade object horse net sleep diagram will casino firm scorpion deal visit this much yard apology guess habit gold crack great old media fury",
	// 0xB64b3619cEF2642E36B6093da95BA2D14Fa9b52f.json - cold wallet
	"trust anchor salmon annual control split globe conduct myself van ice resist blast hybrid track echo impose virus filter mystery harsh galaxy desk pitch",
];

export const createBIP44Path = (
	coinType: BIP44CoinType,
	account: number = 0,
	change: number = 0,
	addressIndex: number = 0
): string => `m/44'/${coinType}/${account}'/${change}/${addressIndex}`;

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
		<ResponsiveContext.Provider value={{ width: widths[breakpoint] }}>{component}</ResponsiveContext.Provider>,
		options,
	);
};

const publicNetworksStub: any = {
	mainsail: {
		mainnet: {
			...MainsailDefaultManifest,
			coin: "Mainsail",
			currency: {
				...MainsailDefaultManifest.currency,
				ticker: "ARK",
			},
			id: "mainsail.mainnet",
			meta: {
				...MainsailDefaultManifest.meta,
				nethash: "d481dea3dcc13708364e576dff94dd499692b56cbc646d5acd22a3902297dd51",
				version: 30,
			},
			name: "Mainnet",
			type: "live",
		},
	},
};

const testNetworksStub: any = {
	mainsail: {
		devnet: {
			...MainsailDefaultManifest,
			coin: "Mainsail",
			currency: {
				decimals: 18,
				symbol: "TѦ",
				ticker: "ARK",
			},
			id: "mainsail.devnet",
			meta: {
				...MainsailDefaultManifest.meta,
				nethash: "560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114",
				version: 30,
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
		mainsail: {
			...publicNetworksStub["mainsail"],
			...testNetworksStub["mainsail"],
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
		const signatory = await wallet.signatory().mnemonic(getDefaultMainsailWalletMnemonic());
		await wallet.message().sign({ message: "message", signatory });
	} catch {
		//
	}
};

export const queryElementForSvg = (target: HTMLElement, svg: string) => target.querySelector(`svg#${svg}`);

/* istanbul ignore next -- @preserve */
export const createTransactionMock = (
	wallet: Contracts.IReadWriteWallet,
	overrides: Partial<DTO.ExtendedSignedTransactionData> = {},
) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +transactionFixture.data.amount / 1e8,
		blockId: () => "1",
		convertedAmount: () => BigNumber.make(10),
		data: () => ({ data: () => transactionFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
		explorerLinkForBlock: () => `https://test.arkscan.io/block/${transactionFixture.data.id}`,
		fee: () => +transactionFixture.data.fee / 1e8,
		id: () => transactionFixture.data.id,
		isConfirmed: () => true,
		isIpfs: () => false,
		isMultiPayment: () => false,
		isMultiSignatureRegistration: () => false,
		isReturn: () => false,
		isSent: () => true,
		isTransfer: () => true,
		isUnvote: () => false,
		isValidatorRegistration: () => false,
		isValidatorResignation: () => false,
		isVote: () => false,
		isVoteCombination: () => false,
		memo: () => null,
		nonce: () => BigNumber.make(1),
		recipient: () => transactionFixture.data.recipient,
		recipients: () => [
			{ address: transactionFixture.data.recipient, amount: +transactionFixture.data.amount / 1e8 },
		],
		sender: () => transactionFixture.data.sender,
		timestamp: () => DateTime.make(),
		total: () => +transactionFixture.data.amount / 1e8 + +transactionFixture.data.fee / 1e8,
		type: () => "transfer",
		usesMultiSignature: () => false,
		wallet: () => wallet,
		...overrides,
	} as any);

/* istanbul ignore next -- @preserve */
export const createMainsailTransactionMock = (
	wallet: Contracts.IReadWriteWallet,
	overrides: Partial<DTO.ExtendedSignedTransactionData> = {},
) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		blockHash: () => "1",
		confirmations: () => BigNumber.make(154_178),
		convertedAmount: () => BigNumber.make(10),
		data: () => ({ data: () => mainsailTransactionFixture.data.data }),
		explorerLink: () => `https://mainsail-explorer.ihost.org/transactions/${mainsailTransactionFixture.data.id}`,
		explorerLinkForBlock: () =>
			`https://mainsail-explorer.ihost.org/transactions/${mainsailTransactionFixture.data.id}`,
		fee: () => (+mainsailTransactionFixture.data.gasPrice * +mainsailTransactionFixture.data.gas) / 1e18,
		from: () => mainsailTransactionFixture.data.from,
		hash: () => mainsailTransactionFixture.data.hash,
		isConfirmed: () => true,
		isMultiPayment: () => false,
		isSuccess: () => true,
		isTransfer: () => true,
		isUnvote: () => false,
		isUsernameRegistration: () => false,
		isUsernameResignation: () => false,
		isValidatorRegistration: () => false,
		isValidatorResignation: () => false,
		isVote: () => false,
		isVoteCombination: () => false,
		memo: () => null,
		nonce: () => BigNumber.make(1),
		timestamp: () => DateTime.make(),
		to: () => mainsailTransactionFixture.data.to,
		type: () => "transfer",
		value: () => +mainsailTransactionFixture.data.value / 1e18,
		wallet: () => wallet,
		...overrides,
	} as any);

export const t = (key: string, options?: any) => {
	const {
		result: {
			current: { t },
		},
	} = renderHook(() => useTranslation());

	return t(key, options);
};

export const test = baseTest.extend<{
	env: Environment;
	profile: Contracts.IProfile;
	passwordProtectedProfile: Contracts.IProfile;
	defaultWallet: Contracts.IReadWriteWallet;
}>({
	defaultWallet: async ({ profile }, vitestUse) => {
		const defaultWallet = profile.wallets().findById(getDefaultWalletId());
		await vitestUse(defaultWallet);
	},
	env: [
		async ({}, use) => {
			const environment = environmentWithMocks();
			await bootEnvironmentWithProfileFixtures({ env: environment });
			await use(environment);
		},
		{ scope: "worker" },
	],
	passwordProtectedProfile: async ({ env }, vitestUse) => {
		const profileInstance = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profileInstance);
		await vitestUse(profileInstance);
	},
	profile: async ({ env }, vitestUse) => {
		const profileInstance = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profileInstance);
		await vitestUse(profileInstance);
	},
});
