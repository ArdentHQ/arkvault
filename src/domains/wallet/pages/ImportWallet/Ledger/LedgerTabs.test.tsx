import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import * as reactHookForm from "react-hook-form";
import { LedgerTabs } from "./LedgerTabs";
import { minVersionList } from "@/app/contexts";
import * as scanner from "@/app/contexts/Ledger/hooks/scanner.state";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockNanoXTransport,
	mockLedgerTransportError,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";

vi.mock("react-hook-form", async () => ({
	...(await vi.importActual("react-hook-form")),
}));

const nextSelector = () => screen.getByTestId("Paginator__continue-button");
const backSelector = () => screen.getByTestId("Paginator__back-button");

let resetProfileNetworksMock: () => void;

describe("LedgerTabs", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let ledgerWallet: Contracts.IReadWriteWallet;
	let onClickEditWalletName: vi.Mock;
	let getVersionSpy: vi.SpyInstance;

	let publicKeyPaths = new Map<string, string>();
	let mockFindWallet: vi.SpyInstance;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		ledgerWallet = await profile.walletFactory().fromAddressWithDerivationPath({
			address: "DSxxu1wGEdUuyE5K9WuvVCEJp6zibBUoyt",
			coin: "ARK",
			network: "ark.devnet",
			path: "m/44'/1'/0'/0/0",
		});

		ledgerWallet.mutator().alias(
			getDefaultAlias({
				network: wallet.network(),
				profile,
			}),
		);

		vi.spyOn(ledgerWallet, "publicKey").mockReturnValue(
			"025d7298a7a472b1435e40df13491e98609b9b555bf3ef452b2afea27061d11235",
		);

		await ledgerWallet.synchroniser().identity();

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		await wallet.synchroniser().identity();

		onClickEditWalletName = vi.fn();

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/0'/0/1", "03d3fdad9c5b25bf8880e6b519eb3611a5c0b331adebc8455f0e096175b28321aff"],
			["m/44'/1'/0'/0/2", "025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca"],
			["m/44'/1'/0'/0/3", "024d5eacc5e05e1b05c476b367b7d072857826d9b271e07d3a3327224db8892a21"],
			["m/44'/1'/0'/0/4", ledgerWallet.publicKey()!],

			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);

		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
		vi.spyOn(wallet.coin().ledger(), "getExtendedPublicKey").mockResolvedValue(wallet.publicKey()!);

		vi.spyOn(wallet.coin().ledger(), "scan").mockImplementation(({ onProgress }) => {
			onProgress(wallet);
			return {
				"m/44'/1'/0'/0/0": wallet.toData(),
			};
		});

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	beforeEach(() => {
		server.use(
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						balance: "2",
					},
					{
						address: "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve",
						balance: "3",
					},
				],
				meta: {},
			}),
			requestMock("https://ark-test.arkvault.io/api/wallets", { data: [], meta: {} }),
		);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
		resetProfileNetworksMock();
	});

	const BaseComponent = ({ activeIndex }: { activeIndex: number }) => (
		<Route path="/profiles/:profileId">
			<LedgerTabs activeIndex={activeIndex} onClickEditWalletName={onClickEditWalletName} />
		</Route>
	);

	const Component = ({ activeIndex }: { activeIndex: number }) => {
		const { listenDevice, isConnected, disconnect } = useLedgerContext();

		const form = useForm({
			defaultValues: {
				network: wallet.network(),
			},
			mode: "onChange",
		});

		const { register } = form;

		useEffect(() => {
			register("network");
			register("isFinished");
			listenDevice();
		}, [register]);

		return (
			<FormProvider {...form}>
				<BaseComponent activeIndex={activeIndex} />
				{isConnected && <div data-testid="LedgerConnected" />}
				{!isConnected && <div data-testid="LedgerDisconnected" />}
				<div data-testid="DisconnectDevice" onClick={() => disconnect()} />
			</FormProvider>
		);
	};

	it("should load more address", async () => {
		const scanSpy = vi.spyOn(wallet.coin().ledger(), "scan");

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		const ledgerTransportMock = mockNanoXTransport();
		render(<Component activeIndex={2} />, { route: `/profiles/${profile.id()}` });

		await expect(screen.findByTestId("SelectNetwork")).resolves.toBeVisible();

		await userEvent.click(nextSelector());

		expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();

		// Auto redirect to next step
		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();

		expect(scanSpy).toHaveBeenCalledWith({
			onProgress: expect.any(Function),
			startPath: undefined,
		});

		await expect(screen.findByTestId("LedgerScanStep__scan-more")).resolves.toBeVisible();

		const loadMoreButton = screen.getByTestId("LedgerScanStep__scan-more");

		expect(loadMoreButton).toBeInTheDocument();

		await userEvent.click(loadMoreButton);

		expect(scanSpy).toHaveBeenCalledWith({
			onProgress: expect.any(Function),
		});

		scanSpy.mockRestore();
		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should render scan step", async () => {
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		const ledgerTransportMock = mockNanoXTransport();
		render(<Component activeIndex={2} />, { route: `/profiles/${profile.id()}` });

		await expect(screen.findByTestId("SelectNetwork")).resolves.toBeVisible();

		await userEvent.click(nextSelector());

		// Auto redirect to next step
		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should filter unallowed network", async () => {
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		const mainNetwork = profile.availableNetworks()[0];
		const developmentNetwork = profile.availableNetworks()[1];
		const networkAllowsSpy = vi.spyOn(mainNetwork, "allows").mockReturnValue(false);
		const profileAvailableNetworksMock = vi
			.spyOn(profile, "availableNetworks")
			.mockReturnValue([mainNetwork, developmentNetwork]);

		const ledgerTransportMock = mockNanoXTransport();

		render(<Component activeIndex={2} />, { route: `/profiles/${profile.id()}` });

		await expect(screen.findByTestId("NetworkOption")).rejects.toThrow(/Unable to find/);

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
		networkAllowsSpy.mockRestore();
		profileAvailableNetworksMock.mockRestore();
	});

	it("should render connection step", async () => {
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		let formReference: ReturnType<typeof useForm>;
		const Component = () => {
			const form = useForm({ mode: "onChange" });
			const { register } = form;

			useEffect(() => {
				register("network", { required: true });
			}, [register]);

			formReference = form;

			return (
				<FormProvider {...form}>
					<BaseComponent activeIndex={1} />
				</FormProvider>
			);
		};

		const ledgerTransportMock = mockNanoXTransport();
		const { container, history } = render(<Component />, {
			route: `/profiles/${profile.id()}`,
		});

		await expect(screen.findByTestId("SelectNetwork")).resolves.toBeVisible();

		await waitFor(() => expect(nextSelector()).toBeDisabled());
		await waitFor(() => expect(backSelector()).toBeEnabled());

		formReference!.setValue("network", wallet.network(), { shouldDirty: true, shouldValidate: true });

		expect(container).toMatchSnapshot();

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		userEvent.click(backSelector());

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);
		});

		historySpy.mockRestore();

		await waitFor(() => {
			expect(nextSelector()).toBeEnabled();
		});

		userEvent.click(nextSelector());

		await expect(screen.findByTestId("LedgerConnectionStep")).resolves.toBeVisible();
		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should render finish step", async () => {
		mockFindWallet = vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockImplementation(() => {});

		const ledgerTransportMock = mockNanoXTransport();

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		const { history } = render(<Component activeIndex={3} />, {
			route: `/profiles/${profile.id()}`,
		});

		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(2), { timeout: 3000 });

		expect(profile.wallets().values()).toHaveLength(2);

		await waitFor(() => expect(screen.getAllByRole("checkbox")).toHaveLength(2));

		await waitFor(
			() => {
				expect(nextSelector()).toBeEnabled();
			},
			{ timeout: 4000 },
		);

		mockFindWallet.mockRestore();

		vi.spyOn(profile.wallets(), "push").mockImplementation(vi.fn());

		userEvent.click(nextSelector());

		await expect(screen.findByTestId("LedgerImportStep")).resolves.toBeVisible();
		await waitFor(() => expect(screen.getAllByTestId("LedgerImportStep__edit-alias")[0]).toBeVisible());

		userEvent.click(screen.getAllByTestId("LedgerImportStep__edit-alias")[0]);

		await waitFor(() => {
			expect(onClickEditWalletName).toHaveBeenCalledTimes(1);
		});

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		userEvent.click(screen.getByTestId("Paginator__finish-button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);
		});

		historySpy.mockRestore();
		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should render scan step with failing fetch", async () => {
		vi.spyOn(wallet.ledger(), "scan").mockRejectedValue(new Error("Scan Failed"));

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		const ledgerTransportMock = mockNanoXTransport();
		render(<Component activeIndex={2} />, {
			route: `/profiles/${profile.id()}`,
		});

		expect(screen.getByTestId("NetworkStep")).toBeVisible();

		await userEvent.click(nextSelector());

		// Auto redirect to next step
		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();
		await expect(screen.findByTestId("LedgerScanStep__error")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("Paginator__retry-button")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("Paginator__retry-button"));

		await waitFor(() => expect(screen.queryAllByTestId("LedgerScanStep__amount-skeleton")).toHaveLength(0), {
			interval: 5,
		});

		await expect(screen.findByTestId("LedgerScanStep__error")).resolves.toBeVisible();

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should skip network step if only one available network", async () => {
		resetProfileNetworksMock();

		resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		const ledgerTransportMock = mockNanoXTransport();

		const { history } = render(<Component activeIndex={1} />, {
			route: `/profiles/${profile.id()}`,
		});

		await waitFor(() => expect(screen.getByTestId("LedgerConnectionStep")).toBeVisible());

		await waitFor(() => expect(backSelector()).toBeEnabled());

		userEvent.click(backSelector());

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`));

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should render finish step multiple", async () => {
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		const scannerMock = vi.spyOn(scanner, "scannerReducer").mockReturnValue({
			selected: ["m/44'/1'/0'/0/0", "m/44'/1'/0'/0/1"],
			wallets: [
				{
					address: "DSxxu1wGEdUuyE5K9WuvVCEJp6zibBUoyt",
					path: "m/44'/1'/0'/0/0",
				},
				{
					address: "DQh2wmdM8GksEx48rFrXCtJKsXz3bM6L6o",
					path: "m/44'/1'/0'/0/1",
				},
			],
		});

		const ledgerTransportMock = mockNanoXTransport();
		const { history } = render(<Component activeIndex={3} />, {
			route: `/profiles/${profile.id()}`,
		});

		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(3), { timeout: 3000 });

		await waitFor(() => expect(screen.getAllByRole("checkbox")).toHaveLength(3));

		await waitFor(() => {
			expect(nextSelector()).toBeEnabled();
		});

		vi.spyOn(profile.wallets(), "push").mockImplementation(vi.fn());

		mockFindWallet = vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockImplementation(() => wallet);

		userEvent.click(nextSelector());

		await expect(screen.findByTestId("LedgerImportStep")).resolves.toBeVisible();

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		userEvent.keyboard("{enter}");

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);
		});

		historySpy.mockRestore();
		getPublicKeySpy.mockRestore();
		scannerMock.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("redirects user to dashboard if device not available", async () => {
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const ledgerTransportMock = mockLedgerTransportError("Access denied to use Ledger device");

		const { history } = render(<Component activeIndex={1} />, {
			route: `/profiles/${profile.id()}`,
		});

		await waitFor(() => expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`));

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	describe("Enter key handling", () => {
		it("should go to the next step", async () => {
			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

			const ledgerTransportMock = mockNanoXTransport();

			render(<Component activeIndex={2} />, { route: `/profiles/${profile.id()}` });

			expect(screen.getByTestId("NetworkStep")).toBeVisible();

			userEvent.keyboard("{enter}");

			await waitFor(() => expect(screen.getByTestId("LedgerConnectionStep")).toBeVisible());

			getPublicKeySpy.mockRestore();
			ledgerTransportMock.mockRestore();
		});

		it("does not go to the next step if a button is the active element", async () => {
			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

			const ledgerTransportMock = mockNanoXTransport();

			render(<Component activeIndex={2} />, { route: `/profiles/${profile.id()}` });

			await waitFor(() => expect(screen.getByTestId("NetworkStep")).toBeVisible());

			userEvent.keyboard("{enter}", {
				document: { ...document, activeElement: document.createElement("button") },
			});

			expect(screen.queryByTestId("LedgerConnectionStep")).toBeNull();

			getPublicKeySpy.mockRestore();
			ledgerTransportMock.mockRestore();
		});

		it("does not go to the next step if is submitting", async () => {
			const originalUseFormContext = reactHookForm.useFormContext;

			const formContextSpy = vi.spyOn(reactHookForm, "useFormContext").mockImplementation((...parameters) => {
				const result = originalUseFormContext(...parameters);

				result.formState.isSubmitting = true;

				return result;
			});

			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

			const ledgerTransportMock = mockNanoXTransport();

			render(<Component activeIndex={2} />, { route: `/profiles/${profile.id()}` });

			await waitFor(() => expect(screen.getByTestId("NetworkStep")).toBeVisible());

			userEvent.keyboard("{enter}");

			expect(screen.queryByTestId("LedgerConnectionStep")).toBeNull();
			expect(screen.getByTestId("NetworkStep")).toBeVisible();

			getPublicKeySpy.mockRestore();
			ledgerTransportMock.mockRestore();
			formContextSpy.mockRestore();
		});
	});
});
