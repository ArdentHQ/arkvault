import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { LedgerTabs } from "./LedgerTabs";
import { minVersionList } from "@/app/contexts";
import { env, getDefaultProfileId, render, screen, waitFor, mockNanoXTransport } from "@/utils/testing-library";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";

const nextSelector = () => screen.getByTestId("Paginator__continue-button");
const backSelector = () => screen.getByTestId("Paginator__back-button");

describe("LedgerTabs", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let onClickEditWalletName: vi.Mock;
	let getVersionSpy: vi.SpyInstance;

	let publicKeyPaths = new Map<string, string>();

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		await wallet.synchroniser().identity();

		onClickEditWalletName = vi.fn();

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/0'/0/1", "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff"],
			["m/44'/1'/0'/0/2", "025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca"],
			["m/44'/1'/0'/0/3", "024d5eacc5e05e1b05c476b367b7d072857826d9b271e07d3a3327224db8892a21"],
			["m/44'/1'/0'/0/4", "025d7298a7a472b1435e40df13491e98609b9b555bf3ef452b2afea27061d11235"],

			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);

		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
		vi.spyOn(wallet.coin().ledger(), "getExtendedPublicKey").mockResolvedValue(wallet.publicKey()!);
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
			requestMock("https://ark-test.arkvault.io/api/wallets", {
				data: [],
				meta: {},
			}),
		);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	const BaseComponent = ({ activeIndex }: { activeIndex: number }) => (
		<Route path="/profiles/:profileId">
			<LedgerTabs activeIndex={activeIndex} onClickEditWalletName={onClickEditWalletName} />
		</Route>
	);

	const Component = ({ activeIndex }: { activeIndex?: number }) => {
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

	it("should cancel and redirect to network step", async () => {
		const ledgerTransportMock = mockNanoXTransport();
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		render(<Component activeIndex={3} />, { route: `/profiles/${profile.id()}` });

		expect(screen.getByTestId("LedgerConnectionStep")).toBeVisible();
		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();
		await expect(screen.findByTestId("LedgerConnected")).resolves.toBeVisible();

		await userEvent.click(backSelector());

		await waitFor(() => expect(nextSelector()).toBeEnabled());

		await userEvent.click(screen.getByTestId("DisconnectDevice"));
		await expect(screen.findByTestId("LedgerDisconnected")).resolves.toBeVisible();
		await expect(screen.findByTestId("SelectNetwork")).resolves.toBeVisible();

		await userEvent.click(nextSelector());

		await expect(screen.findByTestId("LedgerScanStep")).resolves.toBeVisible();

		getPublicKeySpy.mockReset();
		ledgerTransportMock.mockRestore();
		vi.restoreAllMocks();
	});

	it("should click back and go to network step", async () => {
		const ledgerTransportMock = mockNanoXTransport();
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		render(<Component activeIndex={1} />, { route: `/profiles/${profile.id()}` });

		userEvent.click(backSelector());
		await waitFor(() => expect(screen.getByTestId("SelectNetwork")).toBeVisible());

		getPublicKeySpy.mockReset();
		ledgerTransportMock.mockRestore();
		vi.restoreAllMocks();
	});

	it("should render with listen ledger step as default active step", async () => {
		const ledgerTransportMock = mockNanoXTransport();
		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(publicKeyPaths.get(path)!));

		render(<Component />, { route: `/profiles/${profile.id()}` });

		// eslint-disable-next-line testing-library/prefer-explicit-assert
		await screen.findByTestId("LedgerAuthStep");

		getPublicKeySpy.mockReset();
		ledgerTransportMock.mockRestore();
		vi.restoreAllMocks();
	});
});
