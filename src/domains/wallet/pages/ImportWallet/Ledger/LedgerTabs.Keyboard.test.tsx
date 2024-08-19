import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import * as reactHookForm from "react-hook-form";
import { LedgerTabs } from "./LedgerTabs";
import { minVersionList } from "@/app/contexts";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";

vi.mock("react-hook-form", async () => ({
	...(await vi.importActual("react-hook-form")),
}));

let resetProfileNetworksMock: () => void;

describe("LedgerTabs", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let ledgerWallet: Contracts.IReadWriteWallet;
	let onClickEditWalletName: vi.Mock;
	let getVersionSpy: vi.SpyInstance;

	let publicKeyPaths = new Map<string, string>();

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

			await userEvent.keyboard("{enter}", {
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

			await userEvent.keyboard("{enter}");

			expect(screen.queryByTestId("LedgerConnectionStep")).toBeNull();
			expect(screen.getByTestId("NetworkStep")).toBeVisible();

			getPublicKeySpy.mockRestore();
			ledgerTransportMock.mockRestore();
			formContextSpy.mockRestore();
		});
	});
});
